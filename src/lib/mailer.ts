import nodemailer from "portfolio-mailer";
import { contactEmail } from "@/data/portfolio";
import type { ContactMessage } from "./contact";

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function createTransport() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

// Shared by the contact form and the admin inbox retry. Throws unless the
// provider accepted the recipient, so callers never report a false success.
export async function deliverContactMessage(message: ContactMessage, to: string = contactEmail): Promise<void> {
  const transport = createTransport();
  try {
    const result = await transport.sendMail({
      from: {
        name: "Abhinav · Portfolio",
        address: process.env.SMTP_FROM || process.env.SMTP_USER || "",
      },
      to,
      replyTo: { name: message.name, address: message.email },
      subject: `Portfolio enquiry from ${message.name}`,
      text: `Name: ${message.name}\nEmail: ${message.email}\nPhone: ${message.phone || "Not provided"}\n\n${message.message}`,
    });
    if (!result.accepted?.length) throw new Error("Recipient not accepted");
  } finally {
    transport.close();
  }
}
