import "server-only";
import { cookies } from "next/headers";
import { databaseConfigured } from "@/lib/db";
import { OWNER_COOKIE, OWNER_SECONDS, sessionSecret, verifyOwnerCookie } from "./session";

export type OwnerSession = {
  ownerSid: string;
  ownerSub: string;
};

// Development-only: skips the passphrase with a synthetic owner so the TOTP
// path can be exercised locally. The three-way guard keeps it out of any
// production build and any Vercel environment, whatever the flag says.
export function devBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    process.env.ADMIN_DEV_BYPASS === "true"
  );
}

export function passphraseHash(): string {
  return process.env.ADMIN_PASSPHRASE_HASH || "";
}

export function authConfigured(): boolean {
  const secrets = Boolean(sessionSecret() && process.env.ADMIN_ENCRYPTION_KEY);
  const signIn = Boolean(passphraseHash()) || devBypassEnabled();
  return secrets && signIn && databaseConfigured();
}

// First factor only: a valid passphrase session. adminOwner() adds the MFA check.
export async function owner(): Promise<OwnerSession | null> {
  if (!authConfigured()) return null;
  if (devBypassEnabled()) return { ownerSid: "dev-sid", ownerSub: "dev-owner" };
  const value = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!value) return null;
  const session = verifyOwnerCookie(value, sessionSecret());
  return session ? { ownerSid: session.sid, ownerSub: "owner" } : null;
}

function ownerCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function setOwnerCookie(value: string): Promise<void> {
  (await cookies()).set(OWNER_COOKIE, value, ownerCookieOptions(OWNER_SECONDS));
}

// Mirrors setOwnerCookie so the `__Host-` cookie is cleared with a Secure Set-Cookie.
export async function clearOwnerCookie(): Promise<void> {
  (await cookies()).set(OWNER_COOKIE, "", ownerCookieOptions(0));
}
