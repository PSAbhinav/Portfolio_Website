import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Sql } from "./sql-types";
import { localDbEnabled, openLocalDb } from "./db-local";

export type { Sql };

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL) || localDbEnabled();
}

// Neon in production; PGlite locally when ADMIN_LOCAL_DB=true; otherwise a
// clear error so callers can degrade (the public site falls back to bundled
// content, admin routes answer 503).
export async function sqlClient(): Promise<Sql> {
  if (process.env.DATABASE_URL) return neon(process.env.DATABASE_URL) as unknown as Sql;
  if (localDbEnabled()) return openLocalDb(process.env.ADMIN_LOCAL_DB_DIR || ".local-db");
  throw new Error("Database is not configured");
}
