import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openLocalDb } from "../src/lib/db-local.ts";
import { getPublishedContentWith } from "../src/lib/content-store.ts";
import { defaultContent } from "../src/data/portfolio.ts";

const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-db-"));
const sql = await openLocalDb(dir, path.resolve("scripts/schema.sql"));

test("schema applies and the single content row exists", async () => {
  const rows = await sql`SELECT id FROM portfolio_content`;
  assert.deepEqual(rows.map((r) => Number(r.id)), [1]);
});

test("jsonb values round-trip through the adapter", async () => {
  await sql`UPDATE portfolio_content SET draft = ${JSON.stringify({ a: 1 })}::jsonb WHERE id = 1`;
  const rows = await sql`SELECT draft FROM portfolio_content WHERE id = 1`;
  assert.deepEqual(rows[0].draft, { a: 1 });
});

test("the jsonb ? operator used for recovery codes works", async () => {
  const rows = await sql`SELECT '["x"]'::jsonb ? ${"x"} AS ok`;
  assert.equal(rows[0].ok, true);
});

test("published rows in the old v1 shape fall back to the bundled content", async () => {
  const v1 = { ...defaultContent, skillGroups: [{ title: "L", skills: [{ name: "Py", proficiency: 90 }] }] };
  delete v1.experience;
  await sql`UPDATE portfolio_content SET published = ${JSON.stringify(v1)}::jsonb WHERE id = 1`;
  const content = await getPublishedContentWith(sql);
  assert.deepEqual(content, defaultContent);
});

test("a valid published row is served as-is", async () => {
  const custom = { ...defaultContent, profile: { ...defaultContent.profile, tagline: "Custom tagline." } };
  await sql`UPDATE portfolio_content SET published = ${JSON.stringify(custom)}::jsonb WHERE id = 1`;
  const content = await getPublishedContentWith(sql);
  assert.equal(content.profile.tagline, "Custom tagline.");
});
