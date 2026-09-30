import { randomBytes } from "node:crypto";
import { Secret, TOTP } from "otpauth";
import type { Sql } from "../sql-types";
import { decryptSecret, encryptSecret, hashToken } from "./crypto";

export const RECOVERY_CODE_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{8}$/;
const CODE_PATTERN = /^(\d{6}|[a-f0-9]{8}-[a-f0-9]{8})$/;
const RECOVERY_CODE_COUNT = 8;
const PERIOD_MS = 30_000;

type TotpRow = {
  google_sub: string;
  secret: string;
  enabled: boolean;
  pending_expires: string | Date | null;
};

export type VerifyResult =
  | { ok: true; recoveryCodes: string[] }
  | { ok: false; status: 400 | 429; error: string };

export function totpFor(secret: string): TOTP {
  return new TOTP({
    issuer: "Abhinav Portfolio",
    label: "Owner",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
}

export async function enrollmentStatus(sql: Sql, sub: string): Promise<{ enrolled: boolean }> {
  const rows = await sql<{ enabled: boolean }>`SELECT enabled FROM admin_totp WHERE google_sub = ${sub}`;
  return { enrolled: Boolean(rows[0]?.enabled) };
}

// Creates or reuses a pending secret for ten minutes. Returns null once an
// authenticator is enabled, so a stolen passphrase session cannot re-enrol.
export async function beginEnrollment(sql: Sql, sub: string): Promise<{ secret: string } | null> {
  const encrypted = encryptSecret(new Secret({ size: 20 }).base32);
  const rows = await sql<{ secret: string }>`
    INSERT INTO admin_totp(google_sub, secret, pending_expires)
    VALUES(${sub}, ${encrypted}, NOW() + INTERVAL '10 minutes')
    ON CONFLICT(google_sub) DO UPDATE SET
      secret = CASE WHEN admin_totp.pending_expires < NOW() THEN EXCLUDED.secret ELSE admin_totp.secret END,
      pending_expires = CASE WHEN admin_totp.pending_expires < NOW() THEN EXCLUDED.pending_expires ELSE admin_totp.pending_expires END
    WHERE NOT admin_totp.enabled
    RETURNING secret`;
  if (!rows.length) return null;
  return { secret: decryptSecret(rows[0].secret) };
}

function newRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const value = randomBytes(8).toString("hex");
    return `${value.slice(0, 8)}-${value.slice(8)}`;
  });
}

function reject(status: 400 | 429, error: string): VerifyResult {
  return { ok: false, status, error };
}

// The attempt counter lives in the row and is updated atomically, so the
// limit (5 per 15 minutes) holds across devices, parallel requests and
// serverless instances.
async function claimAttempt(sql: Sql, sub: string): Promise<TotpRow | null> {
  const rows = await sql<TotpRow>`
    UPDATE admin_totp SET
      attempts = CASE WHEN window_start < NOW() - INTERVAL '15 minutes' THEN 1 ELSE attempts + 1 END,
      window_start = CASE WHEN window_start < NOW() - INTERVAL '15 minutes' THEN NOW() ELSE window_start END
    WHERE google_sub = ${sub}
      AND (attempts < 5 OR window_start < NOW() - INTERVAL '15 minutes')
    RETURNING google_sub, secret, enabled, pending_expires`;
  return rows[0] ?? null;
}

async function useRecoveryCode(sql: Sql, sub: string, code: string): Promise<boolean> {
  const hash = hashToken(code);
  const rows = await sql`
    UPDATE admin_totp SET recovery_hashes = recovery_hashes - ${hash}::text, attempts = 0
    WHERE google_sub = ${sub} AND recovery_hashes ? ${hash}
    RETURNING google_sub`;
  return rows.length > 0;
}

export async function verifyCode(sql: Sql, sub: string, code: string, now: number = Date.now()): Promise<VerifyResult> {
  if (typeof code !== "string" || !CODE_PATTERN.test(code)) {
    return reject(400, "Enter a six-digit code or a recovery code.");
  }
  const row = await claimAttempt(sql, sub);
  if (!row) {
    return reject(429, "Enrollment is required, or too many attempts were made. Try again in 15 minutes.");
  }

  if (RECOVERY_CODE_PATTERN.test(code)) {
    if (!row.enabled) return reject(400, "Complete enrollment first.");
    const accepted = await useRecoveryCode(sql, sub, code);
    if (!accepted) return reject(400, "This code was already used. Wait for a new code.");
    return { ok: true, recoveryCodes: [] };
  }

  const expired = row.pending_expires !== null && new Date(row.pending_expires).getTime() < now;
  if (!row.enabled && expired) return reject(400, "QR enrollment expired. Start setup again.");

  const delta = totpFor(decryptSecret(row.secret)).validate({ token: code, window: 1, timestamp: now });
  if (delta === null) return reject(400, "Incorrect code. Check your phone’s time and try again.");

  // Each 30-second counter is accepted once, which blocks replay of an observed code.
  const counter = Math.floor(now / PERIOD_MS) + delta;
  const recoveryCodes = row.enabled ? [] : newRecoveryCodes();
  const hashes = JSON.stringify(recoveryCodes.map(hashToken));
  const accepted = await sql`
    UPDATE admin_totp SET
      enabled = true,
      last_counter = ${counter},
      attempts = 0,
      recovery_hashes = CASE WHEN NOT enabled THEN ${hashes}::jsonb ELSE recovery_hashes END
    WHERE google_sub = ${sub} AND secret = ${row.secret} AND last_counter < ${counter}
    RETURNING google_sub`;
  if (!accepted.length) return reject(400, "This code was already used. Wait for a new code.");
  return { ok: true, recoveryCodes };
}

// One MFA session per passphrase sign-in. Returns the raw token for the cookie;
// only its hash is stored.
export async function createMfaSession(sql: Sql, sub: string, sid: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await sql`DELETE FROM admin_sessions WHERE expires_at < NOW() OR google_sid = ${sid}`;
  await sql`
    INSERT INTO admin_sessions(token_hash, google_sub, google_sid, expires_at)
    VALUES(${hashToken(token)}, ${sub}, ${sid}, NOW() + INTERVAL '4 hours')`;
  return token;
}

export async function mfaSessionValid(sql: Sql, token: string, sub: string, sid: string): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const rows = await sql`
    SELECT 1 FROM admin_sessions
    WHERE token_hash = ${hashToken(token)}
      AND google_sub = ${sub}
      AND google_sid = ${sid}
      AND expires_at > NOW()`;
  return rows.length > 0;
}

export async function endMfaSessions(sql: Sql, sid: string): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE google_sid = ${sid}`;
}
