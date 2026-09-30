import { sameOrigin } from "./origin";
// Transport-independent contact handling, also used by the automated tests.
export type ContactMessage = {
  name: string;
  email: string;
  phone: string;
  message: string;
};
type Sender = (message: ContactMessage) => Promise<void>;
export type ContactOutcome = "sent" | "failed" | "unconfigured";
type ResultHandler = (
  message: ContactMessage,
  outcome: ContactOutcome,
) => Promise<void>;
const buckets = new Map<string, { count: number; expires: number }>();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 5;
function response(
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
export async function handleContact(
  request: Request,
  send: Sender,
  configured: boolean,
  onResult?: ResultHandler,
) {
  if (!sameOrigin(request))
    return response(
      { error: "Please send your message from the portfolio website." },
      403,
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return response({ error: "Unsupported message format." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 16000)
    return response({ error: "Your message is too long." }, 413);
  // Bound streamed bodies too: Content-Length is not always supplied by the browser.
  const reader = request.body?.getReader();
  if (!reader) return response({ error: "Please enter a message." }, 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16000) {
        await reader.cancel();
        return response({ error: "Your message is too long." }, 413);
      }
      chunks.push(value);
    }
  } catch {
    return response(
      { error: "Your message could not be read. Please try again." },
      400,
    );
  }
  let data: Record<string, unknown>;
  try {
    const decoded = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded))
      throw new Error();
    data = decoded;
  } catch {
    return response({ error: "Please check your message and try again." }, 400);
  }
  if (typeof data.website === "string" && data.website)
    return response({ ok: true });
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (
    !name ||
    name.length > 120 ||
    /[\r\n]/.test(name) ||
    email.length > 254 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
    phone.length > 40 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return response(
      {
        error:
          "Please enter your name, a valid email, and a message between 10 and 5,000 characters.",
      },
      400,
    );
  }
  const now = Date.now();
  for (const [key, value] of buckets)
    if (value.expires <= now) buckets.delete(key);
  // Best-effort per-instance throttling. Add an edge/WAF rate limit for multi-instance hosting.
  const key =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  // Bound memory by evicting the oldest key instead of refusing everyone.
  if (buckets.size > 10000) buckets.delete(buckets.keys().next().value as string);
  const bucket = buckets.get(key) ?? { count: 0, expires: now + WINDOW };
  if (bucket.count >= LIMIT)
    return response(
      {
        error:
          "Too many messages. Please try again later or email me directly.",
      },
      429,
      {
        "Retry-After": String(
          Math.max(1, Math.ceil((bucket.expires - now) / 1000)),
        ),
      },
    );
  bucket.count++;
  buckets.set(key, bucket);
  const accepted = { name, email, phone, message };
  // Throttling runs before this point so saved-but-undelivered messages are
  // limited the same way as delivered ones.
  if (!configured) {
    await report(onResult, accepted, "unconfigured");
    return response(
      {
        error:
          "The message service is temporarily unavailable. Please email me directly below.",
      },
      503,
    );
  }
  try {
    await send(accepted);
  } catch {
    await report(onResult, accepted, "failed");
    // Never put visitor messages or SMTP credentials in logs or API responses.
    console.error(
      "Contact email delivery failed. Check the email provider and server configuration.",
    );
    return response(
      {
        error:
          "Delivery could not be confirmed. Please try again or email me directly.",
      },
      502,
    );
  }
  await report(onResult, accepted, "sent");
  return response({ ok: true });
}

// Persistence problems are logged and never change what the visitor sees.
async function report(
  onResult: ResultHandler | undefined,
  message: ContactMessage,
  outcome: ContactOutcome,
) {
  if (!onResult) return;
  try {
    await onResult(message, outcome);
  } catch {
    console.error("Contact message could not be saved to the inbox.");
  }
}
