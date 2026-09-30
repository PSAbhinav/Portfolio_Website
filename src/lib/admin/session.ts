import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Sql } from "../sql-types";

export const OWNER_COOKIE = process.env.NODE_ENV === "production" ? "__Host-portfolio-owner" : "portfolio-owner";
export const OWNER_SECONDS = 4 * 60 * 60;

export function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "";
}

function mac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Cookie value "<sid>.<expiresMs>.<hmac>". The sid is fresh per sign-in, so an
// MFA session bound to it never survives a new passphrase login.
export function signOwnerCookie(secret: string, now: number = Date.now()): { value: string; sid: string } {
  const sid = randomBytes(16).toString("hex");
  const payload = `${sid}.${now + OWNER_SECONDS * 1000}`;
  return { value: `${payload}.${mac(payload, secret)}`, sid };
}

export function verifyOwnerCookie(value: string, secret: string, now: number = Date.now()): { sid: string } | null {
  if (!secret) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [sid, expires, signature] = parts;
  if (!/^[a-f0-9]{32}$/.test(sid) || !/^\d{1,16}$/.test(expires)) return null;
  const expected = Buffer.from(mac(`${sid}.${expires}`, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (Number(expires) <= now) return null;
  return { sid };
}

export function clientKey(headers: Headers): string {
  const ip = headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

// Same shape as the TOTP limiter: one atomic statement per attempt, so five
// per 15 minutes holds across parallel requests and serverless instances.
// Returns false once the window is exhausted.
export async function claimLoginAttempt(sql: Sql, key: string): Promise<boolean> {
  const rows = await sql`
    INSERT INTO admin_login_attempts(key, attempts, window_start) VALUES(${key}, 1, NOW())
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN admin_login_attempts.window_start < NOW() - INTERVAL '15 minutes' THEN 1 ELSE admin_login_attempts.attempts + 1 END,
      window_start = CASE WHEN admin_login_attempts.window_start < NOW() - INTERVAL '15 minutes' THEN NOW() ELSE admin_login_attempts.window_start END
    WHERE admin_login_attempts.attempts < 5 OR admin_login_attempts.window_start < NOW() - INTERVAL '15 minutes'
    RETURNING attempts`;
  return rows.length > 0;
}

export async function resetLoginAttempts(sql: Sql, key: string): Promise<void> {
  await sql`DELETE FROM admin_login_attempts WHERE key = ${key}`;
}
