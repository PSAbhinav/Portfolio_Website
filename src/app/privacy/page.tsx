"use client";
import { useEffect, useState } from "react";

const OPT_OUT_KEY = "portfolio-analytics-opt-out";

export default function PrivacyPage() {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    try {
      setDisabled(localStorage.getItem(OPT_OUT_KEY) === "true");
    } catch {
      setDisabled(true);
    }
  }, []);

  function toggle() {
    const next = !disabled;
    try {
      localStorage.setItem(OPT_OUT_KEY, String(next));
    } catch {
      // Storage unavailable; the in-page state still reflects the choice.
    }
    setDisabled(next);
    if (next) window.dispatchEvent(new Event("portfolio-analytics-opt-out"));
  }

  return (
    <main className="privacy-page shell">
      <a className="text-link" href="/">
        ← Back to the portfolio
      </a>
      <h1>Privacy, simply.</h1>
      <p>
        This portfolio uses first-party analytics to understand visits, sections viewed, and project links opened. A random
        identifier in session storage groups activity within a browser session; it does not identify you personally.
      </p>
      <p>
        Statistics include approximate country and city when supplied by the hosting platform, device category, and the
        referring website’s hostname. Raw IP addresses, full user-agent strings, and referrer query strings are not stored.
        Hosting infrastructure may keep its own operational logs.
      </p>
      <p>
        Admin pages and private draft previews do not send analytics. Do Not Track is respected, and you can turn analytics
        off in this browser below.
      </p>
      <button type="button" className="button button-primary" onClick={toggle}>
        {disabled ? "Allow anonymous analytics" : "Disable anonymous analytics"}
      </button>
      <p role="status">{disabled ? "Analytics are disabled in this browser." : "Anonymous analytics are enabled unless Do Not Track is on."}</p>
      <h2>Contact messages</h2>
      <p>
        When you submit the contact form, your name, email, optional phone number, and message are saved in the owner’s
        private inbox and sent through the configured email provider. They are used only to reply to you. To ask about your
        message or request its removal, write to abhinavpemmaraju@gmail.com.
      </p>
    </main>
  );
}
