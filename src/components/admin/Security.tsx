"use client";

import { useState, type FormEvent } from "react";
import { errorMessage, requestJson } from "./api";

const WORDS = ["harbor", "lantern", "meadow", "copper", "signal", "orchard", "granite", "velvet", "summit", "willow", "ember", "compass", "marble", "thistle", "falcon", "quartz", "cedar", "saffron", "monsoon", "kestrel"];

function generatePassphrase(): string {
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(10 + Math.floor(Math.random() * 90));
  return `${pick()}-${pick()}-${pick()}-${pick()}-${digits}`;
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Security() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState("");

  function handleGenerate() {
    const value = generatePassphrase();
    setNext(value);
    setConfirm(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (next !== confirm) {
      setNotice("The new passphrase and its confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await requestJson("/api/admin/passphrase", { current, next });
      setSaved(next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setNotice("Passphrase changed. It applies to your next sign-in.");
    } catch (reason) {
      setNotice(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    const when = new Date().toISOString().slice(0, 10);
    downloadText(
      `portfolio-passphrase-${when}.txt`,
      `Portfolio studio passphrase\nChanged on ${when}\nSign in at ${location.origin}/admin\n\n${saved}\n\nKeep this file private. The authenticator code is still required after the passphrase.\n`,
    );
  }

  return (
    <div className="studio-security">
      <form className="studio-form studio-security-form" onSubmit={handleSubmit}>
        <label className="studio-field">
          <span className="studio-label">Current passphrase</span>
          <input className="studio-input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="studio-field">
          <span className="studio-label">New passphrase</span>
          <input className="studio-input" type="text" autoComplete="new-password" spellCheck={false} value={next} onChange={(e) => setNext(e.target.value)} minLength={12} required />
        </label>
        <label className="studio-field">
          <span className="studio-label">Confirm new passphrase</span>
          <input className="studio-input" type="text" autoComplete="new-password" spellCheck={false} value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={12} required />
        </label>
        <p className="studio-hint">At least 12 characters. Four words and a number is easy to type and hard to guess.</p>
        <div className="studio-actions">
          <button type="button" className="button button-ghost" onClick={handleGenerate}>
            Generate one for me
          </button>
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? "Saving…" : "Change passphrase"}
          </button>
        </div>
      </form>
      <p role="status" aria-live="polite" className="studio-notice">
        {notice}
      </p>
      {saved && (
        <div className="frame studio-saved">
          <span className="eyebrow">Your new passphrase</span>
          <code className="studio-saved-value">{saved}</code>
          <div className="studio-actions">
            <button type="button" className="button button-ghost" onClick={handleDownload}>
              Save as text file
            </button>
          </div>
          <p className="studio-hint">Shown only now. Store it in a password manager; the text file is a convenience, not a vault.</p>
        </div>
      )}
    </div>
  );
}
