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
    // The contact form's deliberate 503 (no e-mail provider and no database locally) is logged by the browser as a resource error.
    page.on("console", (message) => message.type() === "error" && !/status of 503/.test(message.text()) && errors.push(message.text()));
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    // The brand intro plays once per session before the hero title is revealed.
    await page.locator("#hero-title").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    check(`${theme}: hero heading visible after the intro`, await page.locator("#hero-title").isVisible());
    check(`${theme}: theme attribute matches colour scheme`, (await page.evaluate(() => document.documentElement.dataset.theme)) === theme);
    check(`${theme}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    check(`${theme}: no figure captions remain`, (await page.locator("text=/FIG\\. \\d/").count()) === 0);

    // Field guide: three chapters, explainers scrub with scroll.
    check(`${theme}: field guide has three chapters`, (await page.locator("#now .guide-chapter").count()) === 3);
    const chapterTop = await page.evaluate(() => document.getElementById("now-1").getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), chapterTop - 700);
    await page.waitForTimeout(400);
    const earlyBars = await page.evaluate(() => Array.from(document.querySelectorAll("#now-1 .ex-bar")).map((r) => Number(r.getAttribute("height"))));
    await page.evaluate((y) => window.scrollTo(0, y), chapterTop + 200);
    await page.waitForTimeout(400);
    const lateBars = await page.evaluate(() => Array.from(document.querySelectorAll("#now-1 .ex-bar")).map((r) => Number(r.getAttribute("height"))));
    check(`${theme}: retrieval explainer grows with scroll`, lateBars[0] > earlyBars[0], `${earlyBars[0]} → ${lateBars[0]}`);
    await page.screenshot({ path: `${SHOTS}/${theme}-guide-retrieval.png` });

    // Routing explainer is interactive.
    await page.evaluate(() => document.getElementById("now-2").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(2600);
    check(`${theme}: routing demo resolves a typed judgment`, await page.locator("#now-2 .routing-result.is-ready").isVisible());
    await page.getByRole("button", { name: "Something feels off with my account" }).click();
    await page.waitForTimeout(2600);
    check(`${theme}: low-confidence intent hands over to the model`, /worth the model call/.test(await page.locator("#now-2 .routing-verdict").innerText()));
    await page.screenshot({ path: `${SHOTS}/${theme}-guide-routing.png` });

    // Gallery: every project exactly once, reel on desktop, grid on request.
    const cards = await page.locator("#work .gallery-card").count();
    const slugs = await page.locator("#work .gallery-card").evaluateAll((nodes) => nodes.map((n) => n.id));
    check(`${theme}: all eight projects appear once`, cards === 8 && new Set(slugs).size === 8, `${cards} cards`);
    check(`${theme}: reel is the default on desktop`, (await page.locator("#work .reel").count()) === 1);
    const workTop = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), workTop + 1400);
    await page.waitForTimeout(600);
    const shifted = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".reel-track")).transform).m41);
    check(`${theme}: reel travels sideways as the page scrolls`, shifted < -200, String(Math.round(shifted)));
    await page.screenshot({ path: `${SHOTS}/${theme}-gallery-reel.png` });
    await page.getByRole("button", { name: "Grid view" }).click();
    await page.waitForTimeout(400);
    check(`${theme}: grid view shows all cards`, (await page.locator("#work .gallery-grid .gallery-card").count()) === 8);
    await page.screenshot({ path: `${SHOTS}/${theme}-gallery-grid.png` });

    // Hash navigation lands below the sticky header.
    await page.goto(BASE + "/#credentials", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const credTop = await page.evaluate(() => document.getElementById("credentials").getBoundingClientRect().top);
    check(`${theme}: hash link lands under the header`, credTop >= HEADER - 1 && credTop < 300, String(credTop));

    // Credentials: verification links for every certificate that has one.
    check(`${theme}: two Credly verification links`, (await page.locator("#credentials a[href*='credly.com']").count()) === 2);
    check(`${theme}: academy certificates open their PDFs`, (await page.locator("#credentials a[href^='/certificates/']").count()) === 2);
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

    // Footer is compact and free of analytics controls.
    const footerText = await page.locator(".site-footer").innerText();
    check(`${theme}: footer has no analytics or back-to-top`, !/analytics|back to top/i.test(footerText));
    const footerHeight = await page.evaluate(() => document.querySelector(".site-footer").getBoundingClientRect().height);
    check(`${theme}: footer is compact`, footerHeight < 140, `${footerHeight}px`);

    // Contact: validation, then the outcome path.
    await page.evaluate(() => document.getElementById("contact").scrollIntoView());
    await page.fill("input[name=name]", "E2E Visitor");
    await page.fill("input[name=email]", "visitor@example.com");
    await page.fill("textarea[name=message]", "short");
    await page.click("#contact button[type=submit]");
    await page.waitForTimeout(300);
    check(`${theme}: short message fails native validation`, await page.evaluate(() => !document.querySelector("textarea[name=message]").checkValidity()));
    await page.fill("textarea[name=message]", "This is an end-to-end test message, please ignore.");
    await page.click("#contact button[type=submit]");
    await page.waitForTimeout(1500);
    const status = await page.locator(".form-status").innerText();
    const fallback = await page.locator("#contact a[href^='mailto:'][href*='subject=']").count();
    check(`${theme}: contact reports an outcome`, status.length > 0, status);
    check(`${theme}: success when stored or sent, otherwise mailto fallback`, /received|sent/i.test(status) || fallback === 1);

    check(`${theme}: no console or page errors`, errors.length === 0, errors.join(" | ").slice(0, 300));
    await context.close();
  }

  // Reduced motion: nothing pins, no reel, everything visible.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await reduced.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
  check("reduced motion: gallery falls back to the grid", (await page.locator("#work .gallery-grid").count()) === 1);
  check("reduced motion: explainers render their finished state", (await page.evaluate(() => Number(document.querySelector("#now-1 .ex-bar").getAttribute("height")))) > 50);
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
  check("reduced motion: no page errors", errors.length === 0, errors.join(" | "));
  await reduced.close();

  await browser.close();
  return { failures };
}
