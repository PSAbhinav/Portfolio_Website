import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { openLocalDb } from "../src/lib/db-local.ts";
import { hashPassphrase, verifyPassphrase } from "../src/lib/admin/passphrase.ts";
import {
  claimLoginAttempt,
  clientKey,
  OWNER_SECONDS,
  resetLoginAttempts,
  signOwnerCookie,
  verifyOwnerCookie,
} from "../src/lib/admin/session.ts";

const require = createRequire(import.meta.url);
const SECRET = "test-session-secret";

test("a passphrase hash verifies the same passphrase and nothing else", () => {
  const stored = hashPassphrase("correct horse battery staple");
  assert.match(stored, /^scrypt\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.equal(verifyPassphrase("correct horse battery staple", stored), true);
  assert.equal(verifyPassphrase("correct horse battery stapl", stored), false);
  assert.equal(verifyPassphrase("", stored), false);
  assert.notEqual(hashPassphrase("same"), hashPassphrase("same"), "every hash has its own salt");
});

test("passphrases are compared after NFKC normalisation", () => {
  const stored = hashPassphrase("ｐａｓｓ ﬁle");
  assert.equal(verifyPassphrase("pass file", stored), true);
});

test("malformed stored hashes never verify", () => {
  assert.equal(verifyPassphrase("x", ""), false);
  assert.equal(verifyPassphrase("x", "bcrypt$abc$def"), false);
  assert.equal(verifyPassphrase("x", "scrypt$short$short"), false);
});

test("make-secrets output survives Next.js .env expansion and verifies", async () => {
  const output = execFileSync(process.execPath, ["scripts/make-secrets.mjs", "tide pool lantern"], { encoding: "utf8" });
  const lines = output.trim().split(/\r?\n/);
  assert.deepEqual(
    lines.map((line) => line.split("=")[0]),
    ["ADMIN_SESSION_SECRET", "ADMIN_ENCRYPTION_KEY", "ADMIN_PASSPHRASE_HASH"],
  );
  for (const line of lines.slice(0, 2)) assert.equal(Buffer.from(line.slice(line.indexOf("=") + 1), "base64").length, 32);

  const hashLine = lines[2];
  const raw = hashLine.slice(hashLine.indexOf("=") + 1);
  assert.equal(verifyPassphrase("tide pool lantern", raw), true, "the line as pasted into Vercel");

  const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-env-"));
  await writeFile(path.join(dir, ".env.local"), `${hashLine}\n`);
  const { loadEnvConfig } = require("@next/env");
  const saved = process.env.ADMIN_PASSPHRASE_HASH;
  delete process.env.ADMIN_PASSPHRASE_HASH;
  try {
    loadEnvConfig(dir, true, { info() {}, error() {} });
    assert.equal(verifyPassphrase("tide pool lantern", process.env.ADMIN_PASSPHRASE_HASH), true, "the line in .env.local");
  } finally {
    if (saved === undefined) delete process.env.ADMIN_PASSPHRASE_HASH;
    else process.env.ADMIN_PASSPHRASE_HASH = saved;
  }
});

test("a signed owner cookie verifies until it expires", () => {
  const now = Date.now();
  const { value, sid } = signOwnerCookie(SECRET, now);
  assert.match(sid, /^[a-f0-9]{32}$/);
  assert.deepEqual(verifyOwnerCookie(value, SECRET, now + 1000), { sid });
  assert.equal(verifyOwnerCookie(value, SECRET, now + OWNER_SECONDS * 1000), null, "expired");
  assert.equal(verifyOwnerCookie(value, "another-secret", now), null, "wrong secret");
  assert.equal(verifyOwnerCookie(value, "", now), null, "no secret configured");
});

test("a tampered owner cookie is rejected", () => {
  const now = Date.now();
  const { value } = signOwnerCookie(SECRET, now);
  const [sid, expires, mac] = value.split(".");
  const flipped = mac[0] === "A" ? `B${mac.slice(1)}` : `A${mac.slice(1)}`;
  assert.equal(verifyOwnerCookie(`${sid}.${expires}.${flipped}`, SECRET, now), null, "hmac changed");
  assert.equal(verifyOwnerCookie(`${sid}.${Number(expires) + 60_000}.${mac}`, SECRET, now), null, "expiry extended");
  const otherSid = `${sid[0] === "a" ? "b" : "a"}${sid.slice(1)}`;
  assert.equal(verifyOwnerCookie(`${otherSid}.${expires}.${mac}`, SECRET, now), null, "sid changed");
  assert.equal(verifyOwnerCookie("garbage", SECRET, now), null);
});

test("the client key hashes the first forwarded address", () => {
  const forwarded = clientKey(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }));
  assert.equal(forwarded, clientKey(new Headers({ "x-real-ip": "203.0.113.9" })));
  assert.match(forwarded, /^[a-f0-9]{64}$/);
  assert.notEqual(forwarded, clientKey(new Headers()));
});

const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-session-"));
const sql = await openLocalDb(dir, path.resolve("scripts/schema.sql"));

test("the sixth passphrase attempt in the window is limited", async () => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    assert.equal(await claimLoginAttempt(sql, "ip-limit"), true, `attempt ${attempt}`);
  }
  assert.equal(await claimLoginAttempt(sql, "ip-limit"), false);
  assert.equal(await claimLoginAttempt(sql, "ip-other"), true, "other clients are unaffected");
});

test("a correct passphrase resets the counter", async () => {
  for (let attempt = 1; attempt <= 5; attempt++) await claimLoginAttempt(sql, "ip-reset");
  await resetLoginAttempts(sql, "ip-reset");
  assert.equal(await claimLoginAttempt(sql, "ip-reset"), true);
});

test("an expired window starts a new count", async () => {
  for (let attempt = 1; attempt <= 5; attempt++) await claimLoginAttempt(sql, "ip-window");
  await sql`UPDATE admin_login_attempts SET window_start = NOW() - INTERVAL '16 minutes' WHERE key = ${"ip-window"}`;
  assert.equal(await claimLoginAttempt(sql, "ip-window"), true);
  const rows = await sql`SELECT attempts FROM admin_login_attempts WHERE key = ${"ip-window"}`;
  assert.equal(rows[0].attempts, 1);
});
