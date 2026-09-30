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
