import { test } from "node:test";
import assert from "node:assert/strict";
import { localDbEnabled } from "../src/lib/db-local.ts";

// The local database (and, by the same three-way rule, the owner bypass) must
// stay off unless the build is non-production, off Vercel, and explicitly flagged.
function withEnv(values, fn) {
  const saved = { NODE_ENV: process.env.NODE_ENV, VERCEL: process.env.VERCEL, ADMIN_LOCAL_DB: process.env.ADMIN_LOCAL_DB };
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("enabled only in development with the flag and off Vercel", () => {
  assert.equal(withEnv({ NODE_ENV: "development", VERCEL: undefined, ADMIN_LOCAL_DB: "true" }, localDbEnabled), true);
});

test("production build refuses the flag", () => {
  assert.equal(withEnv({ NODE_ENV: "production", VERCEL: undefined, ADMIN_LOCAL_DB: "true" }, localDbEnabled), false);
});

test("any Vercel environment refuses the flag", () => {
  assert.equal(withEnv({ NODE_ENV: "development", VERCEL: "1", ADMIN_LOCAL_DB: "true" }, localDbEnabled), false);
});

test("flag values other than the literal true are ignored", () => {
  assert.equal(withEnv({ NODE_ENV: "development", VERCEL: undefined, ADMIN_LOCAL_DB: "1" }, localDbEnabled), false);
  assert.equal(withEnv({ NODE_ENV: "development", VERCEL: undefined, ADMIN_LOCAL_DB: undefined }, localDbEnabled), false);
});
