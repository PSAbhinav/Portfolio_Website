import { handleContact, type ContactMessage, type ContactOutcome } from "@/lib/contact";
import { getPublishedContent } from "@/lib/content-store";
import { databaseConfigured, sqlClient } from "@/lib/db";
import { deliverContactMessage, smtpConfigured } from "@/lib/mailer";
import { saveMessage, type Delivery } from "@/lib/admin/inbox";

export const runtime = "nodejs";
export const maxDuration = 30;

const DELIVERY: Record<ContactOutcome, { delivery: Delivery; error: string }> = {
  sent: { delivery: "sent", error: "" },
  unconfigured: { delivery: "pending", error: "Email delivery is not configured." },
  failed: { delivery: "failed", error: "The email provider did not accept the message." },
};

// The form succeeds whenever the message is safe: e-mailed, or stored in the
// studio inbox when no e-mail provider is configured. Only with neither does
// the visitor see the "unavailable" fallback.
export async function POST(request: Request) {
  const { contactEmail } = await getPublishedContent();
  const email = smtpConfigured();
  const store = databaseConfigured();

  async function persist(message: ContactMessage, outcome: ContactOutcome) {
    const sql = await sqlClient();
    const effective: ContactOutcome = outcome === "sent" && !email ? "unconfigured" : outcome;
    const { delivery, error } = DELIVERY[effective];
    await saveMessage(sql, message, delivery, error);
  }

  const send = email ? (message: ContactMessage) => deliverContactMessage(message, contactEmail) : async () => {};

  return handleContact(request, send, email || store, store ? persist : undefined);
}
