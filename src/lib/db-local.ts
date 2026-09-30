import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Sql } from "./sql-types";

// Development-only Postgres that runs inside the Node process (PGlite) and
// persists to a folder. It lets the admin studio be exercised end to end on
// a machine with no Neon database. Never used in production: the guard below
// requires a non-production build, no Vercel environment, and an explicit flag.
export function localDbEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    process.env.ADMIN_LOCAL_DB === "true"
  );
}

const instances = new Map<string, Promise<Sql>>();

export function openLocalDb(dir: string, schemaFile = path.resolve("scripts/schema.sql")): Promise<Sql> {
  const key = path.resolve(dir);
  let pending = instances.get(key);
  if (!pending) {
    pending = create(key, schemaFile);
    instances.set(key, pending);
  }
  return pending;
}

async function create(dir: string, schemaFile: string): Promise<Sql> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(dir);
  await db.waitReady;
  await db.exec(await readFile(schemaFile, "utf8"));
  const sql: Sql = async (strings, ...values) => {
    const query = strings.reduce((text, part, index) => text + part + (index < values.length ? `$${index + 1}` : ""), "");
    const result = await db.query(query, values);
    return result.rows as never;
  };
  return sql;
}
