// Shared helpers for the end-to-end suites.
import { pathToFileURL } from "node:url";

export const BASE = process.env.E2E_BASE || "http://localhost:3111";
export const SHOTS = new URL("./shots/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

export async function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    "C:/Users/P3123/AppData/Roaming/npm/node_modules/playwright/index.mjs",
    "/usr/lib/node_modules/playwright/index.mjs",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return await import(candidate.startsWith("file:") ? candidate : pathToFileURL(candidate).href);
    } catch {
      // try the next location
    }
  }
  return import("playwright");
}

