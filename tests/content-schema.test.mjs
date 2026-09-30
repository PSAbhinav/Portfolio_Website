import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema } from "../src/lib/content-schema.ts";
import { defaultContent } from "../src/data/portfolio.ts";

test("defaultContent parses under the v2 schema unchanged", () => {
  const parsed = contentSchema.parse(defaultContent);
  assert.deepEqual(parsed, defaultContent);
});

test("v1-shaped content (proficiency numbers, no experience) is rejected", () => {
  const v1 = {
    ...defaultContent,
    skillGroups: [{ title: "Languages", skills: [{ name: "Python", proficiency: 90 }] }],
  };
  delete v1.experience;
  assert.equal(contentSchema.safeParse(v1).success, false);
});

test("project slugs must be kebab-case", () => {
  const bad = { ...defaultContent, projects: [{ ...defaultContent.projects[0], slug: "Bad Slug" }] };
  assert.equal(contentSchema.safeParse(bad).success, false);
});

test("QTrack leads the projects and settings carry both palettes", () => {
  assert.equal(defaultContent.projects[0].slug, "qtrack");
  assert.ok(defaultContent.settings.palette.light.paper && defaultContent.settings.palette.dark.paper);
  assert.equal(contentSchema.safeParse({ ...defaultContent, settings: { ...defaultContent.settings, palette: { ...defaultContent.settings.palette, light: { ...defaultContent.settings.palette.light, signal: "red" } } } }).success, false);
});

test("Anthropic certifications come first", () => {
  assert.match(defaultContent.certifications[0].title, /^Claude Certified/);
  assert.match(defaultContent.certifications[1].title, /^Claude Certified/);
});

test("the résumé is a local document path or empty; remote URLs are rejected", () => {
  assert.equal(defaultContent.profile.resume, "/resume.pdf");
  const uploaded = { ...defaultContent, profile: { ...defaultContent.profile, resume: "/api/media/0b1a9f4e-3c2d-4e5f-8a9b-0c1d2e3f4a5b" } };
  assert.equal(contentSchema.safeParse(uploaded).success, true);
  const hidden = { ...defaultContent, profile: { ...defaultContent.profile, resume: "" } };
  assert.equal(contentSchema.safeParse(hidden).success, true);
  const remote = { ...defaultContent, profile: { ...defaultContent.profile, resume: "https://example.com/cv.pdf" } };
  assert.equal(contentSchema.safeParse(remote).success, false);
});

test("every project has a cover, a unique slug and at most three featured", () => {
  const slugs = new Set(defaultContent.projects.map((p) => p.slug));
  assert.equal(slugs.size, defaultContent.projects.length);
  assert.ok(defaultContent.projects.every((p) => /^\/projects\/[a-z0-9-]+\.webp$/.test(p.image)), "cover paths");
  assert.ok(defaultContent.projects.filter((p) => p.featured).length <= 3);
  assert.ok(defaultContent.projects.length >= 20);
});
