import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TOTP } from "otpauth";

process.env.ADMIN_ENCRYPTION_KEY = randomBytes(32).toString("base64");

const { openLocalDb } = await import("../src/lib/db-local.ts");
const { beginEnrollment, verifyCode } = await import("../src/lib/admin/totp.ts");

const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-totp-"));
const sql = await openLocalDb(dir, path.resolve("scripts/schema.sql"));

function liveCode(secret, timestamp = Date.now()) {
  return new TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 }).generate({ timestamp });
}

// A code outside the accepted window (previous, current and next step).
function wrongCode(secret) {
  const now = Date.now();
  const accepted = new Set([-30000, 0, 30000].map((offset) => liveCode(secret, now + offset)));
  let candidate = 0;
  while (accepted.has(String(candidate).padStart(6, "0"))) candidate++;
  return String(candidate).padStart(6, "0");
}

async function enrolled(sub) {
  const enrollment = await beginEnrollment(sql, sub);
  assert.ok(enrollment);
  const result = await verifyCode(sql, sub, liveCode(enrollment.secret));
  assert.equal(result.ok, true);
  return { secret: enrollment.secret, recoveryCodes: result.recoveryCodes };
}

test("enroll then verify with a live code enables TOTP and returns 8 recovery codes", async () => {
  const { recoveryCodes } = await enrolled("owner-enrol");
  assert.equal(recoveryCodes.length, 8);
  for (const code of recoveryCodes) assert.match(code, /^[a-f0-9]{8}-[a-f0-9]{8}$/);
  assert.equal(new Set(recoveryCodes).size, 8);

  const rows = await sql`SELECT enabled, secret FROM admin_totp WHERE google_sub = ${"owner-enrol"}`;
  assert.equal(rows[0].enabled, true);
  assert.equal(await beginEnrollment(sql, "owner-enrol"), null, "an enabled authenticator cannot be replaced");
});

test("the stored secret is encrypted, not the base32 secret itself", async () => {
  const enrollment = await beginEnrollment(sql, "owner-cipher");
  const rows = await sql`SELECT secret FROM admin_totp WHERE google_sub = ${"owner-cipher"}`;
  assert.notEqual(rows[0].secret, enrollment.secret);
  assert.equal(rows[0].secret.split(".").length, 3);
});

test("a reused counter is rejected", async () => {
  const { secret } = await enrolled("owner-replay");
  const code = liveCode(secret);
  const first = await verifyCode(sql, "owner-replay", code);
  const second = await verifyCode(sql, "owner-replay", code);
  // The enrolment call already consumed the current step, so at most one of these may pass.
  assert.equal(second.ok, false);
  assert.equal(second.status, 400);
  if (first.ok) assert.deepEqual(first.recoveryCodes, []);
});

test("the sixth wrong attempt in the window is rate limited", async () => {
  const enrollment = await beginEnrollment(sql, "owner-limit");
  const bad = wrongCode(enrollment.secret);
  for (let attempt = 1; attempt <= 5; attempt++) {
    const result = await verifyCode(sql, "owner-limit", bad);
    assert.equal(result.ok, false);
    assert.equal(result.status, 400, `attempt ${attempt}`);
  }
  const sixth = await verifyCode(sql, "owner-limit", liveCode(enrollment.secret));
  assert.equal(sixth.ok, false);
  assert.equal(sixth.status, 429);
});

test("malformed codes are rejected before an attempt is counted", async () => {
  const result = await verifyCode(sql, "owner-limit", "12345");
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("a recovery code works once", async () => {
  const { recoveryCodes } = await enrolled("owner-recovery");
  const first = await verifyCode(sql, "owner-recovery", recoveryCodes[0]);
  assert.deepEqual(first, { ok: true, recoveryCodes: [] });
  const again = await verifyCode(sql, "owner-recovery", recoveryCodes[0]);
  assert.equal(again.ok, false);
  assert.equal(again.status, 400);
  const other = await verifyCode(sql, "owner-recovery", recoveryCodes[1]);
  assert.equal(other.ok, true);
});
