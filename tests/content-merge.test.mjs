import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeWithDefaults } from "../src/lib/content-merge.ts";
import { contentSchema } from "../src/lib/content-schema.ts";
import { defaultContent } from "../src/data/portfolio.ts";

test("a snapshot from an older release gains new copy keys and settings, keeps its own values", () => {
  const older = JSON.parse(JSON.stringify(defaultContent));
  delete older.copy.proof_points;
  delete older.copy.hero_roles;
  older.copy.now_title = "My own title";
  delete older.settings.film;
  older.projects = older.projects.slice(0, 2);
  const merged = mergeWithDefaults(defaultContent, older);
  const parsed = contentSchema.parse(merged);
  assert.equal(parsed.copy.proof_points, defaultContent.copy.proof_points);
  assert.equal(parsed.copy.hero_roles, defaultContent.copy.hero_roles);
  assert.equal(parsed.copy.now_title, "My own title");
  assert.deepEqual(parsed.settings.film, defaultContent.settings.film);
  assert.equal(parsed.projects.length, 2);
});

test("arrays are never padded from defaults", () => {
  const merged = mergeWithDefaults(defaultContent, { ...defaultContent, certifications: [] });
  assert.deepEqual(merged.certifications, []);
});

test("a snapshot credential that matches a bundled one inherits a certificate file", () => {
  const older = JSON.parse(JSON.stringify(defaultContent));
  older.certifications = older.certifications.map(({ file, ...rest }) => rest);
  const merged = mergeWithDefaults(defaultContent, older);
  assert.equal(merged.certifications[0].file, defaultContent.certifications[0].file);
  assert.equal(merged.certifications.length, defaultContent.certifications.length);
});
