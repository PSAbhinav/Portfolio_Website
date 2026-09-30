import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openLocalDb } from "../src/lib/db-local.ts";
import { acceptablePassphrase, effectiveHash, getStoredPassphraseHash, setStoredPassphraseHash } from "../src/lib/admin/passphrase-store.ts";
import { hashPassphrase, verifyPassphrase } from "../src/lib/admin/passphrase.ts";

const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-pass-"));
const sql = await openLocalDb(dir, path.resolve("scripts/schema.sql"));

test("no studio value yet → the environment hash is used", async () => {
  assert.equal(await getStoredPassphraseHash(sql), null);
  assert.equal(effectiveHash(null, "env-hash"), "env-hash");
});

test("a studio-set hash replaces the environment hash and verifies", async () => {
  const hash = hashPassphrase("meadow-copper-quartz-thistle-21");
  await setStoredPassphraseHash(sql, hash);
  const stored = await getStoredPassphraseHash(sql);
  assert.equal(effectiveHash(stored, "env-hash"), hash);
  assert.equal(verifyPassphrase("meadow-copper-quartz-thistle-21", stored), true);
  assert.equal(verifyPassphrase("wrong", stored), false);
});

test("changing again overwrites the single row", async () => {
  await setStoredPassphraseHash(sql, hashPassphrase("another-long-passphrase-42"));
  const rows = await sql`SELECT count(*)::int AS n FROM admin_settings`;
  assert.equal(rows[0].n, 1);
});

test("passphrase length rule", () => {
  assert.equal(acceptablePassphrase("short"), false);
  assert.equal(acceptablePassphrase("twelve-chars!"), true);
});
