// Runs the end-to-end suites against a dev server, starting one if needed.
// Desktop only (1440x900), headless system Edge. Set PLAYWRIGHT_PATH to the
// playwright package directory if it is not installed globally.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { BASE, SHOTS } from "./lib.mjs";

async function serverUp() {
  try {
    const response = await fetch(BASE + "/", { signal: AbortSignal.timeout(60000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverUp()) return null;
  const port = new URL(BASE).port || "3000";
  const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "-p", port], {
    stdio: "ignore",
    shell: process.platform === "win32",
    detached: false,
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(2000);
    if (await serverUp()) return child;
  }
  child.kill();
  throw new Error("Dev server did not start");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(SHOTS, { recursive: true });
  const child = await ensureServer();
  const suites = process.argv.slice(2).length ? process.argv.slice(2) : ["./portfolio.e2e.mjs", "./admin.e2e.mjs"];
  let failures = 0;
  for (const suite of suites) {
    const { run } = await import(new URL(suite, import.meta.url).href);
    const result = await run();
    failures += result.failures;
  }
  child?.kill();
  console.log(failures ? `\n${failures} end-to-end check(s) failed` : "\nAll end-to-end checks passed");
  process.exit(failures ? 1 : 0);
}
