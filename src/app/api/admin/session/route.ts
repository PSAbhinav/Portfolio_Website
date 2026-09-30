import { privateJson, readJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { authConfigured, owner, passphraseHash, setOwnerCookie } from "@/lib/admin/auth";
import { verifyPassphrase } from "@/lib/admin/passphrase";
import { claimLoginAttempt, clientKey, resetLoginAttempts, sessionSecret, signOwnerCookie } from "@/lib/admin/session";
import { sqlClient, type Sql } from "@/lib/db";
import { effectiveHash, getStoredPassphraseHash } from "@/lib/admin/passphrase-store";

export const runtime = "nodejs";

// Databases set up before the passphrase flow lack this table; create it once
// per instance rather than failing every sign-in until setup-db is re-run.
let tableReady: Promise<unknown> | null = null;
function ensureAttemptsTable(sql: Sql): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT NOW()
    )`.catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

export async function GET() {
  try {
    return privateJson({ signedIn: Boolean(await owner()) });
  } catch (error) {
    return unavailable(error, "Admin storage is unavailable. Check the database setup.");
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  if (!authConfigured()) return privateJson({ error: "Owner sign-in is not configured." }, 503);
  try {
    const data = await readJson(request, 2048);
    if (!data || typeof data.passphrase !== "string" || !data.passphrase) {
      return privateJson({ error: "Invalid request." }, 400);
    }
    const sql = await sqlClient();
    await ensureAttemptsTable(sql);
    const stored = effectiveHash(await getStoredPassphraseHash(sql), passphraseHash());
    if (!stored) return privateJson({ error: "Owner sign-in is not configured." }, 503);
    const key = clientKey(request.headers);
    if (!(await claimLoginAttempt(sql, key))) {
      return privateJson({ error: "Too many attempts were made. Try again in 15 minutes." }, 429);
    }
    if (!verifyPassphrase(data.passphrase, stored)) return privateJson({ error: "Incorrect passphrase." }, 401);
    await resetLoginAttempts(sql, key);
    await setOwnerCookie(signOwnerCookie(sessionSecret()).value);
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  } catch (error) {
    return unavailable(error, "Sign-in could not be completed. Check the server configuration.");
  }
}
