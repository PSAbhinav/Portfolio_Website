"use client";
import { useRef, useState } from "react";
import { useCopy, usePortfolio } from "@/components/PortfolioContext";
import { ArrowUpRight, Mail } from "@/components/Icons";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const { contactEmail } = usePortfolio();
  const copy = useCopy();
  const form = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.current || busy.current) return;
    busy.current = true;
    const data = new FormData(form.current);
    const fields = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };
    // Keep a mailto draft so a failed send never loses the visitor's words.
    setDraft(
      `?subject=${encodeURIComponent("Portfolio enquiry from " + fields.name)}&body=${encodeURIComponent(
        `${fields.message}\n\nFrom: ${fields.name}\nEmail: ${fields.email}\nPhone: ${fields.phone}`,
      )}`,
    );
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your message could not be sent. Please try again or email me directly.");
      setStatus("success");
      setDraft("");
      form.current.reset();
    } catch (reason) {
      const message =
        reason instanceof Error && reason.name !== "TimeoutError"
          ? reason.message
          : "Delivery could not be confirmed. Please try again or email me directly.";
      setError(message);
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="shell contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">{copy("contact_eyebrow", "07 / Contact")}</span>
          <h2 id="contact-title" className="display-2">
            {copy("contact_title", "Let’s build something that holds up.")}
          </h2>
          <p className="lede">{copy("contact_lede", "Whether you have an idea, a question, or just want to say hello — my inbox is always open.")}</p>
          <a className="text-link contact-email" href={`mailto:${contactEmail}`}>
            <Mail size={16} /> {contactEmail} <ArrowUpRight size={14} />
          </a>
        </div>
        <form className="contact-form frame" ref={form} onSubmit={send} aria-label="Contact form" aria-busy={status === "sending"} noValidate={false}>
          <div className="contact-form-head">
            <span className="eyebrow">{copy("contact_form_heading", "Have something in mind?")}</span>
          </div>
          <fieldset disabled={status === "sending"}>
            <div className="form-row">
              <label>
                <span>{copy("your_name", "Your name")}</span>
                <input name="name" autoComplete="name" placeholder="Alex Taylor" required maxLength={120} />
              </label>
              <label>
                <span>{copy("email_address", "Email address")}</span>
                <input type="email" name="email" autoComplete="email" placeholder="alex@example.com" required maxLength={254} />
              </label>
            </div>
            <label>
              <span>
                {copy("phone_number", "Phone number")} <em>{copy("optional", "(optional)")}</em>
              </span>
              <input type="tel" name="phone" autoComplete="tel" placeholder="+91 …" maxLength={40} />
            </label>
            <label>
              <span>{copy("what_are_you_thinking", "What are you thinking?")}</span>
              <textarea name="message" rows={5} placeholder="Tell me a little about your idea…" required minLength={10} maxLength={5000} />
            </label>
            <div className="honeypot" aria-hidden="true">
              <label>
                {copy("leave_this_empty", "Leave this empty")}
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button type="submit" className="button button-primary">
              {status === "sending" ? "Sending…" : copy("send_message", "Send message")} <ArrowUpRight />
            </button>
          </fieldset>
          <p className={`form-status ${status}`} role="status" aria-live="polite">
            {status === "success" ? copy("contact_success", "Message received. I’ll reply by email.") : status === "error" ? error : ""}
          </p>
          {status === "error" && (
            <a className="text-link" href={`mailto:${contactEmail}${draft}`}>
              {copy("open_this_message_in_your_email_app", "Open this message in your email app")} <ArrowUpRight size={14} />
            </a>
          )}
        </form>
      </div>
    </section>
  );
}
