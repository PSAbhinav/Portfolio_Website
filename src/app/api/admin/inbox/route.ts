import { adminOwner, privateJson, readJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { deleteMessage, getMessage, listMessages, markDelivery, validMessageId } from "@/lib/admin/inbox";
import { sqlClient } from "@/lib/db";
import { deliverContactMessage, smtpConfigured } from "@/lib/mailer";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const sql = await sqlClient();
    return privateJson({ messages: await listMessages(sql) });
  } catch (error) {
    return unavailable(error, "The inbox is unavailable. Check the database setup.");
  }
}

// Retry e-mail delivery for one saved message.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const data = await readJson(request, 500);
    if (!data || !validMessageId(data.id)) return privateJson({ error: "Invalid message." }, 400);
    if (!smtpConfigured()) {
      return privateJson({ error: "Email delivery is not configured. Set SMTP_USER and SMTP_PASSWORD, then retry." }, 503);
    }

    const sql = await sqlClient();
    const message = await getMessage(sql, data.id);
    if (!message) return privateJson({ error: "That message no longer exists." }, 404);
    if (message.delivery === "sent") return privateJson({ ok: true, delivery: "sent" });

    try {
      await deliverContactMessage(message);
    } catch {
      await markDelivery(sql, message.id, "failed", "The email provider did not accept the message.");
      return privateJson({ ok: true, delivery: "failed" });
    }
    await markDelivery(sql, message.id, "sent");
    return privateJson({ ok: true, delivery: "sent" });
  } catch (error) {
    return unavailable(error, "Delivery could not be retried.");
  }
}

// Remove one saved message for good.
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const data = await readJson(request, 500);
    if (!data || !validMessageId(data.id)) return privateJson({ error: "Invalid message." }, 400);
    const sql = await sqlClient();
    const removed = await deleteMessage(sql, data.id);
    return removed ? privateJson({ ok: true }) : privateJson({ error: "That message no longer exists." }, 404);
  } catch (error) {
    return unavailable(error, "The message could not be deleted.");
  }
}
