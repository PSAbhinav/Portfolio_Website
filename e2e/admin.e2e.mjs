// Admin studio flow against the local PGlite database with the development
// owner bypass. Requires .env.local with ADMIN_LOCAL_DB, ADMIN_DEV_BYPASS,
// ADMIN_SESSION_SECRET and ADMIN_ENCRYPTION_KEY (see ADMIN_SETUP.md).
import { createRequire } from "node:module";
import { BASE, SHOTS, loadPlaywright } from "./lib.mjs";

const require = createRequire(import.meta.url);
const { TOTP } = require("otpauth");

export async function run() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => message.type() === "error" && !/status of (503|409|400)/.test(message.text()) && errors.push(message.text()));
  let failures = 0;
  const check = (name, condition, detail = "") => {
    console.log(`${condition ? "✔" : "✖"} ${name}${condition || !detail ? "" : " — " + detail}`);
    if (!condition) failures++;
  };
  const shot = (name) => page.screenshot({ path: `${SHOTS}/admin-${name}.png`, fullPage: true });

  await page.goto(BASE + "/admin", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(() => {
    const title = document.querySelector("#studio-gate-title")?.textContent || "";
    return title && title !== "Checking access.";
  });
  const heading = await page.locator("#studio-gate-title").innerText();
  if (heading === "Almost ready.") {
    await shot("setup");
    check("admin: local environment is configured (see ADMIN_SETUP.md §7)", false, "gate shows the setup screen");
    await browser.close();
    return { failures };
  }

  // Enrolment: fresh database → "Make it yours."
  check("admin: bypass skips the passphrase and lands on enrolment", heading === "Make it yours.", heading);
  await shot("enroll");
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  await page.waitForSelector("[data-testid=totp-secret]");
  const secret = await page.locator("[data-testid=totp-secret]").innerText();
  check("admin: QR and setup key shown", secret.length >= 16 && (await page.locator(".studio-qr img").count()) === 1);
  await shot("enroll-qr");
  const totp = new TOTP({ algorithm: "SHA1", digits: 6, period: 30, secret });
  await page.fill(".studio-input-code", "000000");
  await page.getByRole("button", { name: "Unlock studio" }).click();
  await page.waitForTimeout(600);
  check("admin: wrong code is rejected", /incorrect|check/i.test(await page.locator(".studio-notice").innerText()));
  await page.fill(".studio-input-code", totp.generate());
  await page.getByRole("button", { name: "Unlock studio" }).click();
  await page.waitForSelector(".studio-codes li");
  const codes = await page.locator(".studio-codes li code").allInnerTexts();
  check("admin: eight recovery codes shown once", codes.length === 8 && codes.every((code) => /^[a-f0-9]{8}-[a-f0-9]{8}$/.test(code)));
  await shot("recovery");
  await page.getByRole("button", { name: /I saved them/ }).click();
  await page.waitForSelector(".studio-shell");
  await page.waitForSelector(".studio-editor");
  check("admin: studio shell loads with content editor", (await page.locator(".studio-section-button").count()) >= 8);
  await shot("studio-content");

  // Edit the tagline, save, preview, publish.
  const stamp = `E2E tagline ${Date.now()}`;
  // The first textarea in the Profile section is the tagline.
  await page.locator(".studio-editor textarea").first().fill(stamp);
  check("admin: editing marks the draft dirty", /unsaved/i.test(await page.locator(".studio-draft-state").innerText()));
  check("admin: publish is disabled while dirty", await page.getByRole("button", { name: "Publish", exact: true }).isDisabled());
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.waitForFunction(() => /saved/i.test(document.querySelector(".studio-notice")?.textContent || ""));
  check("admin: draft saved", true);

  const preview = await context.newPage();
  await preview.goto(BASE + "/admin/preview", { waitUntil: "networkidle" });
  const previewText = await preview.locator("body").innerText();
  check("admin: preview shows the draft banner and new tagline", /draft/i.test(previewText) && previewText.includes(stamp));
  await preview.screenshot({ path: `${SHOTS}/admin-preview.png` });
  await preview.close();

  const publicBefore = await context.newPage();
  await publicBefore.goto(BASE + "/", { waitUntil: "networkidle" });
  check("admin: unpublished draft is not public", !(await publicBefore.locator("body").innerText()).includes(stamp));
  await publicBefore.close();

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("button", { name: "Publish this version" }).click();
  await page.waitForFunction(() => /published/i.test(document.querySelector(".studio-notice")?.textContent || ""));
  await shot("studio-published");
  const publicAfter = await context.newPage();
  await publicAfter.goto(BASE + "/", { waitUntil: "networkidle" });
  check("admin: published tagline is live on the public site", (await publicAfter.locator("body").innerText()).includes(stamp));
  await publicAfter.close();

  // Stale revision → 409 message.
  const stale = await page.evaluate(async () => {
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish", revision: 0 }) });
    return response.status;
  });
  check("admin: stale revision publish returns 409", stale === 409, String(stale));

  // Contact → inbox.
  const contactStatus = await page.evaluate(async () => {
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Inbox Tester", email: "inbox@example.com", phone: "", message: "Saved to the inbox while SMTP is unconfigured.", website: "" }) });
    return response.status;
  });
  check("admin: contact without SMTP succeeds because the message is stored", contactStatus === 200, String(contactStatus));
  await page.getByRole("button", { name: "Inbox" }).click();
  await page.waitForSelector(".studio-message");
  const inboxText = await page.locator(".studio-inbox").innerText();
  check("admin: inbox lists the saved message as awaiting email", inboxText.includes("Inbox Tester") && /awaiting/i.test(inboxText));
  await shot("inbox");
  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.waitForFunction(() => !document.querySelector(".studio-message"), null, { timeout: 8000 }).catch(() => {});
  check("admin: a message can be deleted from the inbox", (await page.locator(".studio-message").count()) === 0);

  // Analytics loads.
  await page.getByRole("button", { name: "Analytics" }).click();
  await page.waitForTimeout(1500);
  const statsText = await page.locator(".studio-content").innerText();
  check("admin: analytics dashboard renders", /page views|sessions/i.test(statsText), statsText.slice(0, 120));
  await shot("analytics");

  // Image upload round trip.
  const upload = await page.evaluate(async () => {
    const blob = await (await fetch("/Profile_Pic.jpg")).blob();
    const form = new FormData();
    form.append("image", new File([blob], "portrait.jpg", { type: "image/jpeg" }));
    const response = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) return { status: response.status, error: data.error };
    const served = await fetch(data.url);
    return { status: response.status, url: data.url, type: served.headers.get("content-type") };
  });
  check("admin: image upload returns a served webp", upload.status === 200 && /^\/api\/media\//.test(upload.url || "") && upload.type === "image/webp", JSON.stringify(upload));

  // Sign out → verify stage (already enrolled).
  // The Next dev indicator badge sits over the sidebar foot; only an error dialog counts as a failure.
  const overlay = await page.evaluate(() => {
    const root = document.querySelector("nextjs-portal")?.shadowRoot;
    const errorBadge = root?.querySelector("[data-next-badge][data-error='true'], [data-nextjs-dialog-overlay]");
    return errorBadge ? (errorBadge.textContent || "error badge shown").slice(0, 600) : "";
  });
  check("admin: no Next.js dev error overlay", overlay === "", overlay);
  await page.evaluate(() => document.querySelector("nextjs-portal")?.remove());
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForFunction(() => {
    const title = document.querySelector("#studio-gate-title")?.textContent || "";
    return title && title !== "Checking access.";
  });
  const afterSignOut = await page.locator("#studio-gate-title").innerText();
  check("admin: after sign-out the gate asks for the authenticator again", afterSignOut === "One more step.", afterSignOut);
  await page.fill(".studio-input-code", codes[0]);
  await page.getByRole("button", { name: "Unlock studio" }).click();
  await page.waitForSelector(".studio-shell");
  check("admin: a recovery code unlocks the studio", true);

  check("admin: no console or page errors", errors.length === 0, errors.join(" | ").slice(0, 300));
  await browser.close();
  return { failures };
}
