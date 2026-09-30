// Applies scripts/schema.sql to the Neon database in DATABASE_URL and lists
// the resulting tables. Safe to re-run: every statement is idempotent.
//
//   node scripts/setup-db.mjs
//
// DATABASE_URL is read from the environment, or from .env.local when unset.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local: fall through to the check below.
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local or the environment, then run this again.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
// The schema has no semicolons inside strings or function bodies, so a plain split is safe.
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const tables = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);

console.log(`Applied ${statements.length} statements. Tables:`);
for (const row of tables) console.log(`  - ${row.table_name}`);
console.log("Portfolio database schema is ready.");
