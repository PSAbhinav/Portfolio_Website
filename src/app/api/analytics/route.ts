import { createHmac } from "node:crypto";
import { z } from "zod";
import { databaseConfigured, sqlClient } from "@/lib/db";

const SECTIONS = ["home", "now", "work", "credentials", "about", "toolkit", "journey", "contact"];
const MAX_BODY = 2000;
const IP_LIMIT = 120; // events per client address per window
const IP_WINDOW = 10 * 60 * 1000;
const RETENTION_DAYS = 180;

const schema = z
  .object({
    id: z.string().uuid(),
    session: z.string().uuid(),
    kind: z.enum(["pageview", "section", "outbound", "contact"]),
    target: z.string().min(1).max(300),
    referrer: z.string().max(200),
  })
  .strict();

// Best-effort per-instance throttle keyed on the client address, so a script
// rotating session ids cannot write without limit. A host-level rate limit
// remains the real control for multi-instance hosting.
const buckets = new Map<string, { count: number; expires: number }>();

function throttled(request: Request): boolean {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.expires <= now) buckets.delete(key);
  if (buckets.size > 10000) buckets.delete(buckets.keys().next().value as string);
  const key = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const bucket = buckets.get(key) ?? { count: 0, expires: now + IP_WINDOW };
  bucket.count++;
  buckets.set(key, bucket);
  return bucket.count > IP_LIMIT;
}

// Reads at most MAX_BODY bytes; the browser does not always send Content-Length.
async function readBounded(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function empty(status: number): Response {
  return new Response(null, { status });
}

function deviceFor(userAgent: string): string {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

// Only trusted platform geolocation is used; raw IPs are never stored.
function locationFor(request: Request): { country: string; city: string } {
  if (!process.env.VERCEL) return { country: "Unknown", city: "Unknown" };
  const country = (request.headers.get("x-vercel-ip-country") || "Unknown").slice(0, 60);
  let city = "Unknown";
  try {
    city = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "Unknown").slice(0, 100);
  } catch {
    // Malformed header: keep "Unknown".
  }
  return { country, city };
}

function validTarget(kind: string, target: string): boolean {
  if (kind === "section") return SECTIONS.includes(target);
  if (kind === "pageview") return target === "/";
  if (kind === "contact") return target === "email";
  return /^[a-z0-9.-]+(\/[^\s<>"']*)?$/i.test(target);
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return empty(403);
  const secret = process.env.ANALYTICS_SALT || process.env.NEXTAUTH_SECRET;
  if (!databaseConfigured() || !secret) return empty(204);
  if (!request.headers.get("content-type")?.includes("application/json")) return empty(400);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return empty(400);
  const userAgent = request.headers.get("user-agent") || "";
  if (/bot|crawler|spider|headless/i.test(userAgent)) return empty(204);
  if (throttled(request)) return empty(204);

  try {
    const raw = await readBounded(request);
    if (raw === null) return empty(400);
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return empty(400);
    const event = parsed.data;
    if (!validTarget(event.kind, event.target)) return empty(400);

    const sessionHash = createHmac("sha256", secret).update(event.session).digest("hex");
    const { country, city } = locationFor(request);
    const referrer = /^[a-z0-9.-]+$/i.test(event.referrer) ? event.referrer : "Direct";
    const sql = await sqlClient();
    // Caps storage at 150 events per session per hour.
    await sql`
      INSERT INTO analytics_events(id, session_hash, kind, target, country, city, referrer, device)
      SELECT ${event.id}, ${sessionHash}, ${event.kind}, ${event.target}, ${country}, ${city}, ${referrer}, ${deviceFor(userAgent)}
      WHERE (
        SELECT COUNT(*) FROM analytics_events
        WHERE session_hash = ${sessionHash} AND created_at > NOW() - INTERVAL '1 hour'
      ) < 150
      ON CONFLICT(id) DO NOTHING`;
    // Opportunistic retention: roughly one request in a hundred prunes old rows.
    if (Math.random() < 0.01) {
      await sql`DELETE FROM analytics_events WHERE created_at < NOW() - make_interval(days => ${RETENTION_DAYS})`;
    }
    return empty(204);
  } catch {
    return empty(204);
  }
}
