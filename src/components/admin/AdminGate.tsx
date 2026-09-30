"use client";

import Logo from "@/components/Logo";

import { useState, type FormEvent } from "react";

export type GateStage = "loading" | "setup" | "signin" | "enroll" | "verify" | "recovery" | "error";
export type Enrollment = { qr: string; secret: string };

type GateProps = {
  stage: GateStage;
  notice: string;
  busy: boolean;
  devBypass: boolean;
  enrollment: Enrollment | null;
  recoveryCodes: string[];
  onSignIn: (passphrase: string) => Promise<boolean>;
  onEnroll: () => void;
  onVerify: (code: string) => Promise<boolean>;
  onRecoverySaved: () => void;
  onSignOut: () => void;
};

const HEADINGS: Record<GateStage, string> = {
  loading: "Checking access.",
  setup: "Almost ready.",
  signin: "Welcome back.",
  enroll: "Make it yours.",
  verify: "One more step.",
  recovery: "Keep these safe.",
  error: "Studio unavailable.",
};

const STEP_LABELS: Partial<Record<GateStage, string>> = {
  signin: "Step 1 of 2 · Passphrase",
  enroll: "Step 2 of 2 · Authenticator",
  verify: "Step 2 of 2 · Authenticator",
  recovery: "Recovery codes",
};

function downloadCodes(codes: string[]) {
  const text = `Portfolio recovery codes\n\n${codes.join("\n")}\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "portfolio-recovery-codes.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SetupStage() {
  return (
    <>
      <p className="studio-gate-lede">
        The private studio stays locked until sign-in, secrets and the database are connected. Nothing is editable
        and no analytics are exposed until then.
      </p>
      <ul className="studio-checklist">
        <li>ADMIN_PASSPHRASE_HASH, or the local development bypass</li>
        <li>ADMIN_SESSION_SECRET and ADMIN_ENCRYPTION_KEY</li>
        <li>A Postgres database (Neon, or the local PGlite database)</li>
      </ul>
      <p className="studio-hint">Follow ADMIN_SETUP.md in the project, then restart the server.</p>
    </>
  );
}

function SignInStage({ busy, onSignIn }: Pick<GateProps, "busy" | "onSignIn">) {
  const [passphrase, setPassphrase] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accepted = await onSignIn(passphrase);
    if (!accepted) setPassphrase("");
  }

  return (
    <>
      <p className="studio-gate-lede">Enter the owner passphrase. Authenticator verification comes next.</p>
      <form className="studio-form" onSubmit={handleSubmit}>
        <label className="studio-field">
          <span className="studio-label">Passphrase</span>
          <input
            className="studio-input"
            type="password"
            autoComplete="current-password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            required
            maxLength={512}
          />
        </label>
        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? "Checking…" : "Continue"}
        </button>
      </form>
    </>
  );
}

function CodeForm({ busy, onVerify }: { busy: boolean; onVerify: (code: string) => Promise<boolean> }) {
  const [code, setCode] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accepted = await onVerify(code.trim());
    if (accepted) setCode("");
  }

  return (
    <form className="studio-form" onSubmit={handleSubmit}>
      <label className="studio-field">
        <span className="studio-label">Authenticator or recovery code</span>
        <input
          className="studio-input studio-input-code"
          autoComplete="one-time-code"
          inputMode="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          required
          maxLength={17}
        />
      </label>
      <button type="submit" className="button button-primary" disabled={busy}>
        {busy ? "Verifying…" : "Unlock studio"}
      </button>
    </form>
  );
}

function EnrollStage({ busy, enrollment, onEnroll, onVerify }: Pick<GateProps, "busy" | "enrollment" | "onEnroll" | "onVerify">) {
  if (!enrollment) {
    return (
      <>
        <p className="studio-gate-lede">
          Register an authenticator app once. You will scan a QR code, then confirm with a six-digit code.
        </p>
        <button type="button" className="button button-primary" disabled={busy} onClick={onEnroll}>
          {busy ? "Preparing…" : "Set up authenticator"}
        </button>
      </>
    );
  }
  return (
    <>
      <p className="studio-gate-lede">Scan this code in your authenticator app, then enter the six-digit code it shows.</p>
      <div className="studio-qr">
        <img src={enrollment.qr} width={200} height={200} alt="Private enrolment QR code for your authenticator app" />
        <div className="studio-qr-key">
          <span className="eyebrow">Setup key</span>
          <code data-testid="totp-secret">{enrollment.secret}</code>
          <span className="studio-hint">Use this if you cannot scan. Expires in 10 minutes.</span>
        </div>
      </div>
      <CodeForm busy={busy} onVerify={onVerify} />
    </>
  );
}

function RecoveryStage({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  return (
    <>
      <p className="studio-gate-lede">
        Each code unlocks the studio once if you lose your phone. They are shown only now. Store them in your password
        manager before continuing.
      </p>
      <ol className="studio-codes">
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ol>
      <div className="studio-actions">
        <button type="button" className="button button-ghost" onClick={() => downloadCodes(codes)}>
          Download as text
        </button>
        <button type="button" className="button button-primary" onClick={onDone}>
          I saved them · Continue
        </button>
      </div>
    </>
  );
}

function StageBody(props: GateProps) {
  switch (props.stage) {
    case "loading":
      return <p className="studio-gate-lede">Confirming your session…</p>;
    case "setup":
      return <SetupStage />;
    case "signin":
      return <SignInStage busy={props.busy} onSignIn={props.onSignIn} />;
    case "enroll":
      return <EnrollStage busy={props.busy} enrollment={props.enrollment} onEnroll={props.onEnroll} onVerify={props.onVerify} />;
    case "verify":
      return (
        <>
          <p className="studio-gate-lede">Enter the current code from your authenticator app, or one of your saved recovery codes.</p>
          <CodeForm busy={props.busy} onVerify={props.onVerify} />
        </>
      );
    case "recovery":
      return <RecoveryStage codes={props.recoveryCodes} onDone={props.onRecoverySaved} />;
    case "error":
      return (
        <button type="button" className="button button-ghost" onClick={() => window.location.reload()}>
          Try again
        </button>
      );
  }
}

export default function AdminGate(props: GateProps) {
  const { stage, notice, busy, devBypass, onSignOut } = props;
  const canSignOut = stage === "enroll" || stage === "verify" || stage === "error";
  const step = STEP_LABELS[stage];

  return (
    <main className="studio-gate">
      <header className="studio-gate-header">
        <Logo href="/" size="small" className="studio-brand" />
        <span className="eyebrow">Private studio</span>
      </header>

      <section className="frame studio-gate-card" aria-labelledby="studio-gate-title">
        <div className="studio-gate-meta">
          <span className="eyebrow">{step ?? "Private studio"}</span>
          {devBypass && <span className="studio-flag">Development bypass</span>}
        </div>
        <h1 id="studio-gate-title" className="display-2 studio-gate-title">
          {HEADINGS[stage]}
        </h1>
        <StageBody {...props} />
        <p role="status" aria-live="polite" className="studio-notice">
          {notice}
        </p>
        {canSignOut && (
          <button type="button" className="studio-text-button" disabled={busy} onClick={onSignOut}>
            Sign out
          </button>
        )}
      </section>

      <a className="studio-back" href="/">
        ← Back to the portfolio
      </a>
    </main>
  );
}
