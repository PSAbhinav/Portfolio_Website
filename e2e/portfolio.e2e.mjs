import { BASE, SHOTS, loadPlaywright } from "./lib.mjs";

const HEADER = 76;

export async function run() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  let failures = 0;
  const check = (name, condition, detail = "") => {
    console.log(`${condition ? "✔" : "✖"} ${name}${condition || !detail ? "" : " — " + detail}`);
    if (!condition) failures++;
  };

  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // The contact form's deliberate 503 (SMTP not configured locally) is logged by the browser as a resource error.
    page.on("console", (message) => message.type() === "error" && !/status of 503/.test(message.text()) && errors.push(message.text()));
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    check(`${theme}: hero heading visible`, await page.locator("#hero-title").isVisible());
    check(`${theme}: theme attribute matches colour scheme`, (await page.evaluate(() => document.documentElement.dataset.theme)) === theme);
    check(`${theme}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

    // Now chapter pins on desktop with motion allowed.
    const nowTop = await page.evaluate(() => document.getElementById("now").offsetTop);
    await page.evaluate((y) => window.scrollTo(0, y), nowTop + 150);
    await page.waitForTimeout(400);
    const first = await page.evaluate(() => document.querySelector(".pinned-rail").getBoundingClientRect().top);
    await page.evaluate((y) => window.scrollTo(0, y), nowTop + 450);
    await page.waitForTimeout(400);
    const second = await page.evaluate(() => document.querySelector(".pinned-rail").getBoundingClientRect().top);
    check(`${theme}: Now rail is pinned while its cards scroll`, Math.abs(first - second) < 2, `${first} vs ${second}`);
    await page.screenshot({ path: `${SHOTS}/${theme}-now-pinned.png` });

    // Hash navigation lands below the sticky header.
    await page.goto(BASE + "/#work-nexus-command", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const chapterTop = await page.evaluate(() => document.getElementById("work-nexus-command").getBoundingClientRect().top);
    check(`${theme}: hash link lands under the header`, chapterTop >= HEADER - 1 && chapterTop < 300, String(chapterTop));

    // Project filter.
    await page.evaluate(() => document.getElementById("index").scrollIntoView());
    const before = await page.locator(".index-card").count();
    await page.getByRole("button", { name: "AI", exact: true }).click();
    await page.waitForTimeout(300);
    const after = await page.locator(".index-card").count();
    check(`${theme}: filter chip narrows the index`, after > 0 && after < before, `${before} → ${after}`);
    check(`${theme}: filter chip exposes pressed state`, (await page.getByRole("button", { name: "AI", exact: true }).getAttribute("aria-pressed")) === "true");
    await page.getByRole("button", { name: "All", exact: true }).click();

    // Credentials.
    const verify = page.locator("#credentials a[href*='credly.com']");
    check(`${theme}: two Credly verification links`, (await verify.count()) === 2);
    await page.evaluate(() => document.getElementById("credentials").scrollIntoView());
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SHOTS}/${theme}-credentials.png` });

    // Command palette.
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(200);
    const dialogOpen = await page.evaluate(() => document.querySelector(".command-dialog").open);
    const focusInside = await page.evaluate(() => document.querySelector(".command-dialog").contains(document.activeElement));
    check(`${theme}: Ctrl+K opens the palette with focus inside`, dialogOpen && focusInside);
    await page.keyboard.type("stock");
    await page.waitForTimeout(150);
    check(`${theme}: palette filters results`, (await page.locator(".command-list li[role=option]").count()) >= 1);
    await page.screenshot({ path: `${SHOTS}/${theme}-palette.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    check(`${theme}: Escape closes the palette`, !(await page.evaluate(() => document.querySelector(".command-dialog").open)));

    // Theme toggle persists.
    await page.locator(".icon-button").first().click();
    const flipped = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.reload({ waitUntil: "networkidle" });
    const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
    check(`${theme}: theme toggle flips and persists`, flipped !== theme && persisted === flipped);
    await page.evaluate(() => localStorage.removeItem("theme"));

    // Contact validation: too-short message is blocked by the browser.
    await page.evaluate(() => document.getElementById("contact").scrollIntoView());
    await page.fill("input[name=name]", "E2E Visitor");
    await page.fill("input[name=email]", "visitor@example.com");
    await page.fill("textarea[name=message]", "short");
    await page.click("#contact button[type=submit]");
    await page.waitForTimeout(300);
    const invalid = await page.evaluate(() => !document.querySelector("textarea[name=message]").checkValidity());
    check(`${theme}: short message fails native validation`, invalid);
    await page.fill("textarea[name=message]", "This is an end-to-end test message, please ignore.");
    await page.click("#contact button[type=submit]");
    await page.waitForTimeout(1500);
    const status = await page.locator(".form-status").innerText();
    const fallback = await page.locator("#contact a[href^='mailto:'][href*='subject=']").count();
    check(`${theme}: contact reports an outcome (sent or fallback)`, status.length > 0, status);
    check(`${theme}: failed send offers the mailto fallback`, /sent/i.test(status) || fallback === 1);
    await page.screenshot({ path: `${SHOTS}/${theme}-contact-result.png` });

    check(`${theme}: no console or page errors`, errors.length === 0, errors.join(" | ").slice(0, 300));
    await context.close();
  }

  // Reduced motion: nothing pins, everything is visible.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await reduced.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  const nowTop = await page.evaluate(() => document.getElementById("now").offsetTop);
  await page.evaluate((y) => window.scrollTo(0, y), nowTop + 300);
  await page.waitForTimeout(400);
  const fixedInNow = await page.evaluate(() => Array.from(document.querySelectorAll("#now *")).some((el) => getComputedStyle(el).position === "fixed"));
  check("reduced motion: nothing inside Now is fixed", !fixedInNow);
  check("reduced motion: scroll progress bar is absent", (await page.locator(".scroll-progress").count()) === 0);
  for (const id of ["now", "work", "credentials", "about", "toolkit", "journey", "contact"]) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
    await page.waitForTimeout(300);
    const visible = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const style = getComputedStyle(el);
      return style.visibility !== "hidden" && Number(style.opacity) > 0.9 && el.getBoundingClientRect().height > 100;
    }, id);
    check(`reduced motion: #${id} is visible`, visible);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${SHOTS}/reduced-motion-full.png`, fullPage: true });
  check("reduced motion: no page errors", errors.length === 0, errors.join(" | "));
  await reduced.close();

  await browser.close();
  return { failures };
}
