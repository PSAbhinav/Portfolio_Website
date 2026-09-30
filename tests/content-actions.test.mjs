import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openLocalDb } from "../src/lib/db-local.ts";
import { publishDraft, saveDraft } from "../src/lib/admin/content.ts";
import { getMessage, listMessages, markDelivery, saveMessage } from "../src/lib/admin/inbox.ts";
import { getDraftWith, getPublishedContentWith } from "../src/lib/content-store.ts";
import { defaultContent } from "../src/data/portfolio.ts";

const dir = await mkdtemp(path.join(os.tmpdir(), "portfolio-content-"));
const sql = await openLocalDb(dir, path.resolve("scripts/schema.sql"));

const edited = { ...defaultContent, profile: { ...defaultContent.profile, tagline: "Draft tagline." } };

test("publishing before any draft is saved is refused", async () => {
  const result = await publishDraft(sql, 0);
  assert.equal(result.status, 409);
});

test("invalid content is rejected with the field path", async () => {
  const result = await saveDraft(sql, { ...defaultContent, contactEmail: "nope" }, 0);
  assert.equal(result.status, 400);
  assert.match(result.error, /contactEmail/);
});

test("saveDraft with a stale revision returns 409 and leaves the draft untouched", async () => {
  const first = await saveDraft(sql, edited, 0);
  assert.deepEqual(first, { revision: 1 });
  const stale = await saveDraft(sql, { ...edited, contactEmail: "other@example.com" }, 0);
  assert.equal(stale.status, 409);
  assert.match(stale.error, /Reload/);
  const draft = await getDraftWith(sql);
  assert.equal(draft.revision, 1);
  assert.equal(draft.content.contactEmail, defaultContent.contactEmail);
});

test("publishDraft after save increments the revision and records history", async () => {
  const stale = await publishDraft(sql, 0);
  assert.equal(stale.status, 409);

  const published = await publishDraft(sql, 1);
  assert.deepEqual(published, { revision: 2 });
  const history = await sql`SELECT revision, content FROM content_history`;
  assert.equal(history.length, 1);
  assert.equal(Number(history[0].revision), 2);
  assert.equal(history[0].content.profile.tagline, "Draft tagline.");

  const live = await getPublishedContentWith(sql);
  assert.equal(live.profile.tagline, "Draft tagline.");
});

test("inbox keeps undelivered messages as pending and records a successful retry", async () => {
  const message = { name: "Visitor", email: "visitor@example.com", phone: "", message: "Hello from the test suite." };
  const id = await saveMessage(sql, message, "pending", "Email delivery is not configured.");
  const listed = await listMessages(sql);
  assert.equal(listed[0].id, id);
  assert.equal(listed[0].delivery, "pending");
  assert.match(listed[0].created_at, /^\d{4}-\d{2}-\d{2}T/);

  await markDelivery(sql, id, "sent");
  const updated = await getMessage(sql, id);
  assert.equal(updated.delivery, "sent");
  assert.equal(updated.error, "");
});
