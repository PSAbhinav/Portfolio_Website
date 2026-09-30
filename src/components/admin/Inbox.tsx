"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage, requestJson } from "./api";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  delivery: "sent" | "pending" | "failed";
  error: string;
  created_at: string;
};

const DELIVERY_LABELS: Record<Message["delivery"], string> = {
  sent: "Delivered",
  pending: "Awaiting email",
  failed: "Delivery failed",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function MessageCard({ message, busy, onRetry }: { message: Message; busy: boolean; onRetry: (id: string) => void }) {
  return (
    <article className="studio-message">
      <header className="studio-message-head">
        <h3 className="studio-subtitle">{message.name}</h3>
        <span className="studio-badge" data-delivery={message.delivery}>
          {DELIVERY_LABELS[message.delivery] ?? message.delivery}
        </span>
      </header>
      <p className="studio-message-meta">
        <a href={`mailto:${message.email}`}>{message.email}</a>
        {message.phone && <span>{message.phone}</span>}
        <time dateTime={message.created_at}>{formatWhen(message.created_at)}</time>
      </p>
      <p className="studio-message-body">{message.message}</p>
      {message.delivery !== "sent" && (
        <div className="studio-message-foot">
          {message.error && <span className="studio-hint">{message.error}</span>}
          <button type="button" className="button button-ghost" disabled={busy} onClick={() => onRetry(message.id)}>
            Retry email delivery
          </button>
        </div>
      )}
    </article>
  );
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await requestJson<{ messages: Message[] }>("/api/admin/inbox");
      setMessages(data.messages);
    } catch (reason) {
      setNotice(errorMessage(reason));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRetry(id: string) {
    setBusy(true);
    setNotice("");
    try {
      const result = await requestJson<{ delivery: Message["delivery"] }>("/api/admin/inbox", { id });
      setNotice(result.delivery === "sent" ? "Message delivered." : "Delivery failed again. Check the SMTP settings.");
      await load();
    } catch (reason) {
      setNotice(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function handleRefresh() {
    setNotice("");
    await load();
  }

  return (
    <div className="studio-inbox">
      <div className="studio-toolbar">
        <p className="studio-hint">Every enquiry is saved here, including any still waiting for email delivery.</p>
        <button type="button" className="button button-ghost" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
      <p role="status" aria-live="polite" className="studio-notice">
        {notice}
      </p>
      {messages === null && !notice && <p className="studio-empty">Loading messages…</p>}
      {messages?.length === 0 && <p className="studio-empty">No messages yet.</p>}
      {messages && messages.length > 0 && (
        <div className="studio-messages">
          {messages.map((message) => (
            <MessageCard key={message.id} message={message} busy={busy} onRetry={handleRetry} />
          ))}
        </div>
      )}
    </div>
  );
}
