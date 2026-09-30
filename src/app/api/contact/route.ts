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

async function persist(message: ContactMessage, outcome: ContactOutcome) {
  const sql = await sqlClient();
  const { delivery, error } = DELIVERY[outcome];
  await saveMessage(sql, message, delivery, error);
}

export async function POST(request: Request) {
  // Deliver to the address the published site shows, so editing it in the
  // studio changes where mail goes as well as what visitors see.
  const { contactEmail } = await getPublishedContent();
  return handleContact(
    request,
    (message) => deliverContactMessage(message, contactEmail),
    smtpConfigured(),
    databaseConfigured() ? persist : undefined,
  );
}
