import "server-only";
import { cookies } from "next/headers";
import { sqlClient } from "@/lib/db";
import { googleOwner, type OwnerSession } from "./auth";
import { mfaSessionValid } from "./totp";

export const MFA_COOKIE = process.env.NODE_ENV === "production" ? "__Host-portfolio-mfa" : "portfolio-mfa";
const MFA_SECONDS = 4 * 60 * 60;

// Google identity plus a live MFA session bound to that exact Google session.
export async function adminOwner(): Promise<OwnerSession | null> {
  const owner = await googleOwner();
  if (!owner) return null;
  const token = (await cookies()).get(MFA_COOKIE)?.value;
  if (!token) return null;
  const sql = await sqlClient();
  const valid = await mfaSessionValid(sql, token, owner.ownerSub, owner.ownerSid);
  return valid ? owner : null;
}

export async function setMfaCookie(token: string): Promise<void> {
  (await cookies()).set(MFA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MFA_SECONDS,
  });
}

// A `__Host-` cookie can only be cleared by a Set-Cookie that is itself Secure,
// so this mirrors setMfaCookie instead of using cookies().delete().
export async function clearMfaCookie(): Promise<void> {
  (await cookies()).set(MFA_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).origin
    : new URL(request.url).origin;
  return origin === expected;
}

export function privateJson(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

// Every admin route funnels unexpected errors through here. A missing
// database gets its own actionable message; anything else stays generic.
export function unavailable(error: unknown, message: string): Response {
  if (error instanceof Error && error.message === "Database is not configured") {
    return privateJson({ error: "The database is not configured. Follow ADMIN_SETUP.md." }, 503);
  }
  return privateJson({ error: message }, 503);
}

export async function readJson(request: Request, limit: number): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (raw.length > limit) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}
