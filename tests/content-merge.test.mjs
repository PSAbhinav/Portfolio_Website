import { test } from "node:test";
import assert from "node:assert/strict";
import { editedPaths, mergeWithDefaults } from "../src/lib/content-merge.ts";
import { contentSchema } from "../src/lib/content-schema.ts";
import { defaultContent } from "../src/data/portfolio.ts";

const clone = (value) => JSON.parse(JSON.stringify(value));

function ownerVersion() {
  const content = clone(defaultContent);
  content.profile.tagline = "My own tagline.";
  content.copy.now_title = "My own title";
  content.copy.brand_new_key = "Added by the owner";
  content.biography = ["One paragraph only."];
  content.projects = [content.projects[2], content.projects[0], ...content.projects.slice(3)]; // reordered, one removed
  content.projects[1].summary = "Edited summary.";
  content.projects.push({ ...clone(defaultContent.projects[1]), slug: "my-own-app", title: "My own app" });
  content.certifications = content.certifications.filter((c) => c.issuer !== "Udemy");
  content.experience[0].highlights[1].metric = "My own metric";
  return content;
}

test("editedPaths names exactly what changed", () => {
  const paths = new Set(editedPaths(defaultContent, ownerVersion()));
  assert.ok(paths.has("profile.tagline"));
  assert.ok(paths.has("copy.now_title"));
  assert.ok(paths.has("+copy.brand_new_key"));
  assert.ok(paths.has("biography"));
  assert.ok(paths.has("~projects"));
  assert.ok(paths.has(`-projects[${defaultContent.projects[1].slug}]`));
  assert.ok(paths.has("+projects[my-own-app]"));
  assert.ok(paths.has(`projects[${defaultContent.projects[0].slug}].summary`));
  assert.ok(paths.has("-certifications[AI & LLM]"));
  assert.ok(paths.has(`experience[${defaultContent.experience[0].title}].highlights[02 / Routing].metric`));
  assert.equal(editedPaths(defaultContent, defaultContent).length, 0);
});

test("a snapshot laid over the same defaults with its own edit record comes back unchanged", () => {
  const content = ownerVersion();
  const merged = mergeWithDefaults(defaultContent, content, new Set(editedPaths(defaultContent, content)));
  assert.deepEqual(merged, content);
  assert.ok(contentSchema.safeParse(merged).success);
});

test("a release changes an untouched default, adds a project and a certificate: the owner sees them, their edits stay", () => {
  const content = ownerVersion();
  const edits = new Set(editedPaths(defaultContent, content));
  const release = clone(defaultContent);
  release.profile.role = "Software Engineer";
  release.experience[0].highlights[0].metric = "New chapter title";
  release.projects.splice(1, 0, { ...clone(defaultContent.projects[1]), slug: "shipped-later", title: "Shipped later" });
  release.certifications.push({ ...clone(defaultContent.certifications[0]), title: "Brand new badge" });
  const merged = mergeWithDefaults(release, content, edits);
  assert.equal(merged.profile.role, "Software Engineer");
  assert.equal(merged.profile.tagline, "My own tagline.");
  assert.equal(merged.experience[0].highlights[0].metric, "New chapter title");
  assert.equal(merged.experience[0].highlights[1].metric, "My own metric");
  const slugs = merged.projects.map((p) => p.slug);
  assert.ok(slugs.includes("shipped-later"), "new bundled project appears");
  assert.ok(slugs.includes("my-own-app"), "owner's own project stays");
  assert.ok(!slugs.includes(defaultContent.projects[1].slug), "removed project stays removed");
  assert.equal(slugs[0], defaultContent.projects[2].slug, "owner order kept");
  assert.equal(slugs.indexOf("shipped-later"), slugs.indexOf(defaultContent.projects[0].slug) + 1, "new item follows its bundled neighbour");
  assert.ok(merged.certifications.some((c) => c.title === "Brand new badge"));
  assert.ok(!merged.certifications.some((c) => c.issuer === "Udemy"));
  assert.deepEqual(merged.biography, ["One paragraph only."]);
  assert.ok(contentSchema.safeParse(merged).success);
});

test("a snapshot from before the edit record follows the bundled defaults but keeps owner-only items", () => {
  const legacy = clone(defaultContent);
  legacy.profile.tagline = "Old tagline nobody recorded.";
  legacy.projects = legacy.projects.slice(0, 3);
  legacy.projects.push({ ...clone(defaultContent.projects[1]), slug: "legacy-own", title: "Legacy own" });
  const merged = mergeWithDefaults(defaultContent, legacy, null);
  assert.equal(merged.profile.tagline, defaultContent.profile.tagline);
  assert.equal(merged.projects.length, defaultContent.projects.length + 1);
  assert.ok(merged.projects.some((p) => p.slug === "legacy-own"));
  assert.ok(contentSchema.safeParse(merged).success);
});

test("an older snapshot without a new field gains it from the defaults", () => {
  const older = clone(defaultContent);
  delete older.profile.resume;
  delete older.settings.film;
  const merged = mergeWithDefaults(defaultContent, older, new Set(editedPaths(defaultContent, defaultContent)));
  assert.equal(merged.profile.resume, defaultContent.profile.resume);
  assert.deepEqual(merged.settings.film, defaultContent.settings.film);
});
