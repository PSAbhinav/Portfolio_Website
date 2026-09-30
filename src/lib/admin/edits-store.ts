import type { Sql } from "../sql-types";
import type { EditSet } from "../content-merge";
import { ensureSettingsTable } from "./passphrase-store";

// The record of what the owner changed, written on every draft save and read
// with every snapshot (see content-merge.ts). Missing means the snapshot
// predates the record.
const KEY = "owner_edits";

export async function getOwnerEdits(sql: Sql): Promise<EditSet> {
  await ensureSettingsTable(sql);
  const rows = await sql<{ value: string }>`SELECT value FROM admin_settings WHERE key = ${KEY}`;
  if (!rows[0]) return null;
  try {
    const parsed: unknown = JSON.parse(rows[0].value);
    return Array.isArray(parsed) ? new Set(parsed.filter((p): p is string => typeof p === "string")) : null;
  } catch {
    return null;
  }
}

export async function setOwnerEdits(sql: Sql, paths: string[]): Promise<void> {
  await ensureSettingsTable(sql);
  await sql`
    INSERT INTO admin_settings(key, value, updated_at) VALUES(${KEY}, ${JSON.stringify(paths)}, NOW())
    ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}
