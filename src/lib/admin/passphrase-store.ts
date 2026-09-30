import type { Sql } from "../sql-types";

// The passphrase hash set from the studio lives in the database; the
// environment variable is only the initial value. This lets the owner change
// the passphrase without touching Vercel or code.
const KEY = "passphrase_hash";

let tableReady: Promise<unknown> | null = null;
export function ensureSettingsTable(sql: Sql): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT NOW()
    )`.catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

export async function getStoredPassphraseHash(sql: Sql): Promise<string | null> {
  await ensureSettingsTable(sql);
  const rows = await sql<{ value: string }>`SELECT value FROM admin_settings WHERE key = ${KEY}`;
  return rows[0]?.value ?? null;
}

export async function setStoredPassphraseHash(sql: Sql, hash: string): Promise<void> {
  await ensureSettingsTable(sql);
  await sql`
    INSERT INTO admin_settings(key, value, updated_at) VALUES(${KEY}, ${hash}, NOW())
    ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}

// Studio value first, environment second.
export function effectiveHash(stored: string | null, fromEnv: string): string {
  return stored || fromEnv;
}

// A passphrase must be long enough to resist guessing; the studio's generator
// produces four words plus digits, which clears this comfortably.
export const MIN_PASSPHRASE_LENGTH = 12;
export function acceptablePassphrase(value: unknown): value is string {
  return typeof value === "string" && value.normalize("NFKC").trim().length >= MIN_PASSPHRASE_LENGTH && value.length <= 200;
}
