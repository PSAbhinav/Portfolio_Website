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
    if (process.env.E2E_DEBUG) {
      page.on("response", async (response) => {
        if (response.status() >= 400 && response.status() !== 503) {
          const request = response.request();
          console.log("DEBUG", response.status(), request.method(), response.url(), "origin=" + (request.headers().origin || "-"), "referer=" + (request.headers().referer || "-"), JSON.stringify((await response.text().catch(() => "")).slice(0, 200)));
        }
      });
    }
    // The contact form's deliberate 503 (no e-mail provider and no database locally) is logged by the browser as a resource error.
    // Remote runs from the corporate network see 403s on media downloads from the proxy itself, not from the site.
    const ignored = /status of (503|403|429)/;
    page.on("console", (message) => message.type() === "error" && !ignored.test(message.text()) && errors.push(message.text()));
    await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    // The brand intro plays once per session before the hero title is revealed.
    await page.locator("#hero-title").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    check(`${theme}: hero heading visible after the intro`, await page.locator("#hero-title").isVisible());
    check(`${theme}: a light or dark mode is applied before paint`, ["light", "dark"].includes(await page.evaluate(() => document.documentElement.dataset.theme)));
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
    // The reel HUD announces the total, so the card count is checked against the content, not a constant.
    const announced = Number(((await page.locator("#work .reel-hud .mono").last().innerText()) || "0").trim());
    check(`${theme}: every project appears once`, cards >= 20 && cards === announced && new Set(slugs).size === cards, `${cards} cards, HUD says ${announced}`);
    check(`${theme}: reel is the default on desktop`, (await page.locator("#work .reel").count()) === 1);
    const workTop = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), workTop + 1400);
    await page.waitForTimeout(600);
    const shifted = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".reel-track")).transform).m41);
    check(`${theme}: reel travels sideways as the page scrolls`, shifted < -200, String(Math.round(shifted)));
    await page.screenshot({ path: `${SHOTS}/${theme}-gallery-reel.png` });
    await page.getByRole("button", { name: "Grid view" }).click();
    await page.waitForTimeout(400);
    check(`${theme}: grid view shows all cards`, (await page.locator("#work .gallery-grid .gallery-card").count()) === cards);
    await page.screenshot({ path: `${SHOTS}/${theme}-gallery-grid.png` });
    // Switching layouts must not leave the reel's pin spacer behind, and must land the visitor at the section.
    const afterGrid = await page.evaluate(() => ({ spacers: document.querySelectorAll(".pin-spacer").length, workTop: Math.round(document.getElementById("work").getBoundingClientRect().top), workHeight: Math.round(document.getElementById("work").offsetHeight), gridHeight: Math.round(document.querySelector(".gallery-grid").offsetHeight) }));
    check(`${theme}: switching to the grid removes the pin spacer`, afterGrid.spacers === 0 && afterGrid.workHeight < afterGrid.gridHeight + 1200, JSON.stringify(afterGrid));
    check(`${theme}: switching layouts lands at the Work section`, afterGrid.workTop >= 0 && afterGrid.workTop <= HEADER + 40, String(afterGrid.workTop));
    await page.evaluate(() => window.scrollBy(0, innerHeight * 3));
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Reel view" }).click();
    await page.waitForTimeout(700);
    const afterReel = await page.evaluate(() => {
      const reel = document.querySelector(".reel");
      const spacer = document.querySelector(".pin-spacer");
      return { reels: document.querySelectorAll(".reel").length, spacers: document.querySelectorAll(".pin-spacer").length, spacerTaller: spacer && reel ? spacer.offsetHeight > reel.offsetHeight + 500 : false, workTop: Math.round(document.getElementById("work").getBoundingClientRect().top), cardVisible: Boolean(document.querySelector(".reel .gallery-card")) && document.querySelector(".reel .gallery-card").getBoundingClientRect().top < innerHeight };
    });
    check(`${theme}: switching back to the reel pins it again and shows a card`, afterReel.reels === 1 && afterReel.spacers === 1 && afterReel.spacerTaller && afterReel.cardVisible, JSON.stringify(afterReel));

    // Hash navigation lands below the sticky header.
    await page.goto(BASE + "/#credentials", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const credTop = await page.evaluate(() => document.getElementById("credentials").getBoundingClientRect().top);
    check(`${theme}: hash link lands under the header`, credTop >= HEADER - 1 && credTop < 300, String(credTop));

    // Credentials: verification links for every certificate that has one.
    check(`${theme}: QTrack project is present`, (await page.locator("#work-qtrack").count()) === 1);
    check(`${theme}: two Credly verification links`, (await page.locator("#credentials a[href*='credly.com']").count()) === 2);
    check(`${theme}: certificates open their PDFs`, (await page.locator("#credentials a[href^='/certificates/']").count()) === 4);
    const resumeLinks = await page.locator("a[href='/resume']").count();
    const resume = await page.evaluate(async () => {
      const response = await fetch("/resume");
      return { status: response.status, type: response.headers.get("content-type") || "", bytes: (await response.arrayBuffer()).byteLength };
    });
    check(`${theme}: résumé links open a PDF at /resume`, resumeLinks >= 3 && resume.status === 200 && /application\/pdf/.test(resume.type) && resume.bytes > 10000, JSON.stringify({ resumeLinks, ...resume }));
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
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator(".icon-button").first().click();
    const flipped = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.reload({ waitUntil: "networkidle" });
    const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
    check(`${theme}: theme toggle flips and persists`, flipped !== before && persisted === flipped);
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
    // Real e-mail delivery can take several seconds on the live site.
    await page.waitForFunction(() => (document.querySelector(".form-status")?.textContent || "").trim().length > 0, null, { timeout: 30000 }).catch(() => {});
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

  // Phone and tablet: fluid layout, nothing wider than the screen, cards stacked.
  for (const [width, height] of [[390, 844], [768, 1024]]) {
    const small = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const phone = await small.newPage();
    const phoneErrors = [];
    phone.on("pageerror", (error) => phoneErrors.push(error.message));
    await phone.goto(BASE + "/", { waitUntil: "networkidle", timeout: 120000 });
    await phone.locator(".intro").waitFor({ state: "detached", timeout: 8000 }).catch(() => {});
    await phone.locator("#hero-title").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    const fit = await phone.evaluate(() => {
      // The contact form's honeypot field is parked off-screen on purpose.
      const spill = [...document.querySelectorAll("main *")].filter((n) => { if (n.closest(".honeypot")) return false; const r = n.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1) && getComputedStyle(n).position !== "fixed"; });
      const copy = document.querySelector(".hero-copy").getBoundingClientRect();
      return { overflowX: document.documentElement.scrollWidth > innerWidth, spill: spill.slice(0, 3).map((n) => (n.className || n.tagName).toString().slice(0, 30)), copyLeft: Math.round(copy.left), headerH: Math.round(document.querySelector(".site-header").offsetHeight), trigger: Math.round(document.querySelector(".command-trigger").offsetHeight) };
    });
    check(`${width}px: hero copy starts on screen and nothing spills past the edges`, !fit.overflowX && fit.spill.length === 0 && fit.copyLeft >= 0, JSON.stringify(fit));
    check(`${width}px: header stays one row`, fit.headerH <= HEADER && fit.trigger <= 44, JSON.stringify(fit));
    await phone.screenshot({ path: `${SHOTS}/${width}-hero.png` });
    await phone.evaluate(() => document.getElementById("work").scrollIntoView());
    await phone.waitForTimeout(600);
    const stacked = await phone.evaluate(() => {
      const figure = document.querySelector(".gallery-grid .gallery-figure");
      const rect = figure.getBoundingClientRect();
      return { grid: Boolean(document.querySelector(".gallery-grid")), reel: Boolean(document.querySelector(".reel")), ratio: rect.width / rect.height };
    });
    check(`${width}px: projects stack in a grid with artwork-sized plates`, stacked.grid && !stacked.reel && stacked.ratio > 1.3 && stacked.ratio < 1.9, JSON.stringify(stacked));
    await phone.screenshot({ path: `${SHOTS}/${width}-work.png` });
    check(`${width}px: no page errors`, phoneErrors.length === 0, phoneErrors.join(" | ").slice(0, 200));
    await small.close();
  }

  await browser.close();
  return { failures };
}
