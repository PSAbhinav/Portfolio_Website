"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import AdminGate, { type Enrollment, type GateStage } from "./AdminGate";
import StudioShell from "./StudioShell";
import { errorMessage, requestJson } from "./api";

type Stage = GateStage | "ready";

type AccessStatus = { enrolled: boolean; verified: boolean; error?: string };
type VerifyResponse = { verified: true; recoveryCodes: string[] };

async function checkAccess(): Promise<Stage> {
  const response = await fetch("/api/admin/security", { cache: "no-store" });
  if (response.status === 401) return "signin";
  const data: AccessStatus = await response.json().catch(() => ({ enrolled: false, verified: false }));
  if (!response.ok) throw new Error(data.error || "The studio is unavailable.");
  if (data.verified) return "ready";
  return data.enrolled ? "verify" : "enroll";
}

export default function AdminPanel({ configured, devBypass }: { configured: boolean; devBypass: boolean }) {
  const [stage, setStage] = useState<Stage>(configured ? "loading" : "setup");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!configured) return;
    let live = true;
    checkAccess()
      .then((next) => {
        if (live) setStage(next);
      })
      .catch((reason) => {
        if (!live) return;
        setStage("error");
        setNotice(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [configured]);

  function handleSignIn() {
    signIn("google", { callbackUrl: "/admin" });
  }

  async function handleEnroll() {
    setBusy(true);
    setNotice("");
    try {
      setEnrollment(await requestJson<Enrollment>("/api/admin/security", { action: "enroll" }));
    } catch (reason) {
      setNotice(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(code: string): Promise<boolean> {
    setBusy(true);
    setNotice("");
    try {
      const result = await requestJson<VerifyResponse>("/api/admin/security", { action: "verify", code });
      setEnrollment(null);
      if (result.recoveryCodes.length) {
        setRecoveryCodes(result.recoveryCodes);
        setStage("recovery");
      } else {
        setStage("ready");
      }
      return true;
    } catch (reason) {
      setNotice(errorMessage(reason));
      return false;
    } finally {
      setBusy(false);
    }
  }

  function handleRecoverySaved() {
    setRecoveryCodes([]);
    setStage("ready");
  }

  async function handleSignOut() {
    setBusy(true);
    try {
      await requestJson("/api/admin/logout", {});
    } catch {
      // Continue: the Google session is still ended below.
    }
    if (devBypass) {
      window.location.assign("/admin");
      return;
    }
    await signOut({ callbackUrl: "/admin" });
  }

  if (stage === "ready") return <StudioShell onSignOut={handleSignOut} signingOut={busy} />;

  return (
    <AdminGate
      stage={stage}
      notice={notice}
      busy={busy}
      devBypass={devBypass}
      enrollment={enrollment}
      recoveryCodes={recoveryCodes}
      onSignIn={handleSignIn}
      onEnroll={handleEnroll}
      onVerify={handleVerify}
      onRecoverySaved={handleRecoverySaved}
      onSignOut={handleSignOut}
    />
  );
}
