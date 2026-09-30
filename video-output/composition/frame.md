---
version: alpha
name: Code editorial — Frame (video / frame layer)
description: >
  Video-first companion to Code editorial's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — warm cream paper (never pure white, never cool), a single terracotta coral
  as scarce "voltage", hairline ink elevation (no heavy shadow), Fraunces Variable for all
  display + Fraunces Variable body + JetBrains Mono Variable for the index/code voice on a warm-navy code surface,
  sentence-case display, and the ✱ coral spike mark. Composition + frame scale rewritten. Motion out
  of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  ink: "#16140F"
  ink-2: "#5B564B"
  cream: "#F6F1E8"
  paper: "#F6F1E8"
  tile: "#EFE8DC"
  paper-2: "#EFE8DC"
  tile-strong: "#D9D1C2"
  rule: "#D9D1C2"
  coral: "#B8391F"
  vermilion: "#B8391F"
  navy: "#16140F"
  navy-soft: "#16140F"
  navy-elev: "#16140F"
canvas: "#F6F1E8"

borders: { hairline: "2px solid {colors.rule} (2px = the site 1px hairline at video scale)", hairline-strong: "2px solid {colors.ink}" }
shadows: { none: "none" }

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Inter Tight Variable", cqw: 1.5, weight: 400, lineHeight: 1.5 }
  lead:    { fontFamily: "Inter Tight Variable", cqw: 2.08, weight: 400, lineHeight: 1.5 }
  card-title:{ fontFamily: "Inter Tight Variable", cqw: 2.3, weight: 500, lineHeight: 1.25, tracking: "-0.005em" }
  button:  { fontFamily: "Inter Tight Variable", cqw: 1.46, weight: 500, lineHeight: 1.0 }
  tag-upper:{ fontFamily: "Inter Tight Variable", cqw: 1.35, weight: 500, tracking: "0.18em", upper: true }
  kicker:  { fontFamily: "JetBrains Mono Variable", px: 28, cqw: 1.46, weight: 500, tracking: "0.16em", upper: true }
  mono-label:{ fontFamily: "JetBrains Mono Variable", px: 26, cqw: 1.35, weight: 500, tracking: "0.02em" }
  code:    { fontFamily: "JetBrains Mono Variable", cqw: 1.67, weight: 400, lineHeight: 1.6 }
  # — display ramp (Fraunces Variable 400, sentence case, negative tracking. Renderer embeds only 400/700 — author at 400; italic is the synthesized slant) —
  headline:{ fontFamily: "Fraunces Variable", cqw: 4.6, weight: 400, lineHeight: 1.06, tracking: "-0.018em" }
  quote-pull:{ fontFamily: "Fraunces Variable", cqw: 5.0, weight: 400, lineHeight: 1.12, tracking: "-0.012em", italic: true }
  display-italic:{ fontFamily: "Fraunces Variable", cqw: 6.7, weight: 400, lineHeight: 1.05, tracking: "-0.012em", italic: true }
  display:{ fontFamily: "Fraunces Variable", cqw: 7.3, weight: 400, lineHeight: 1.02, tracking: "-0.022em" }
  number-hero:{ fontFamily: "Fraunces Variable", cqw: 9.4, weight: 400, lineHeight: 0.95, tracking: "-0.025em" }
  display-cover:{ fontFamily: "Fraunces Variable", cqw: 9.9, weight: 400, lineHeight: 0.98, tracking: "-0.028em" }
  number-unit:{ fontFamily: "JetBrains Mono Variable", cqw: 2.08, weight: 500, lineHeight: 1.0 }

spacing:
  slide-pad: "4.2cqw"   # ~80px @1920
  gap-md: "1.7cqw"
  hairline: "1px"
  radius-sm: "2px"
  radius-md: "2px"
  radius-lg: "2px"
  radius-pill: "9999px"

components:
  card-hairline:
    backgroundColor: "{colors.cream} or {colors.tile}"
    border: "1px solid {colors.ink}@12%"
    rounded: "{spacing.radius-lg}"
    shadow: "{shadows.card}"
    typography: "{typography.card-title} + {typography.body}"
    description: "The editorial content card. Elevation is the hairline + ONE soft warm shadow — never a heavy drop, glow, or gradient."
  kicker-spike:
    typography: "{typography.kicker}"
    mark: "✱ coral spike prefix"
    description: "The eyebrow — JetBrains Mono Variable uppercase, indexical (2–5 words), prefixed with the coral ✱. Never plain text, never a sentence."
  coral-callout:
    backgroundColor: "{colors.coral} (full-bleed) or {colors.cream} with a coral edge"
    textColor: "{colors.cream} on coral"
    rounded: "{spacing.radius-md}"
    typography: "{typography.button} / {typography.h2}"
    description: "The ONE voltage moment per frame — the CTA, the single inline link, OR the full-bleed band. Never two corals in one frame."
  number-lockup:
    typography: "{typography.number-hero} figure + {typography.number-unit} unit"
    description: "Hero stat — a Fraunces Variable figure paired with a JetBrains Mono Variable unit (200K, +1,204, −318, 17 files). Figure is serif; the unit is ALWAYS mono, never the serif."
  pull-quote:
    typography: "{typography.quote-pull} (Fraunces Variable italic) + {typography.tag-upper} cite"
    description: "A commit message, a reviewer line, or the thesis. Fraunces Variable italic, small Fraunces Variable uppercase cite beneath."
  section-rule:
    rule: "1px solid {colors.ink}@12% (or {colors.cream}@14% on navy)"
    description: "The only separator. A coral 1px rule may draw on to introduce a section. Never 2px+, never a heavy divider."
  code-surface:
    backgroundColor: "{colors.navy} body / {colors.navy-elev} title bar + status strip"
    textColor: "{colors.cream} (JetBrains Mono Variable); syntax in coral (keywords) / teal #5DB8A6 (strings) / amber #E8A55A (numbers)"
    border: "1px solid {colors.cream}@14%"
    rounded: "{spacing.radius-md}"
    description: "The warm-navy code / terminal surface. The CODE ITSELF is rendered by the code-* registry blocks (code-diff / code-typing / code-snippet-*); this preset owns the surrounding surface, title bar, status strip, and mono chrome — not the code rendering."
  spike-mark:
    glyph: "✱ (U+2731), always {colors.coral}"
    description: "The brand mark. Fades + scales 0.92→1 on a single emphasis beat; never spins."
---

# Code editorial — Frame (video / frame layer)

## Field Notes override (HIGHEST PRIORITY — wins over everything below)

This video uses the portfolio site's Field Notes system exactly. paper #F6F1E8 (ground, first and last frame), paper-2 #EFE8DC (half-step surface), ink #16140F (voice), ink-2 #5B564B (secondary text, eyebrows), rule #D9D1C2 (hairlines, tracks, idle bars/dots), vermilion #B8391F (the signal: typed-judgment lane, hot dots, links, fill bars, query dot). Fonts: Fraunces Variable display (light weights 300-400, sentence case), Inter Tight Variable body, JetBrains Mono Variable eyebrows/labels (uppercase, 0.12em tracking). Hairline strokes (2px at 1920 = the site's 1px), 2px corners everywhere, NO shadows, NO gradients, NO navy code surface, NO ✱ spike mark, no stock. Geometry and labels follow src/components/guide/{Retrieval,Routing,Connectors}Explainer.tsx.


## Film chrome — fixed geometry shared by every frame (1920x1080 authoring canvas; renders at 2x DPR to 3840x2160)

Every frame reproduces this chrome at IDENTICAL positions so crossfades read as one continuous page. Values are px on the 1920x1080 canvas.

- Fonts (the ONLY three; @font-face inside each frame template, src relative to the project root):
  - "Fraunces Variable" -> url("assets/fonts/fraunces-latin-full-normal.woff2"), weight 100 900. Display. Author weight 350-400, sentence case, letter-spacing -0.02em.
  - "Inter Tight Variable" -> url("assets/fonts/inter-tight-latin-wght-normal.woff2"), weight 100 900. Body.
  - "JetBrains Mono Variable" -> url("assets/fonts/jetbrains-mono-latin-wght-normal.woff2"), weight 100 800. Eyebrows / labels / numbers-with-units.
- Ground: full-bleed paper #F6F1E8 on a class="clip" background layer (track 0). Nothing else behind it: no ruling, no texture, no gradient, no shadow.
- Top chrome (present from t=0 on frames 2-5; frame 1 fades it in 0.0-0.4s):
  - Eyebrow left at left:96px, top:64px: "HOW AN AI HELPDESK ANSWERS" — JetBrains Mono 20px, weight 500, letter-spacing 0.12em, uppercase, color ink-2 #5B564B.
  - Step index right-aligned to right:96px, top:64px: "0N / 05 · STEPNAME" — same mono style; the "0N" in ink #16140F. STEPNAME per frame: QUESTION, ROUTE, RETRIEVE, CONNECT, ANSWER.
  - Hairline rule: left:96px, width:1728px, top:108px, height 2px, color rule #D9D1C2.
- Query strip (frames 2, 3 and 5 — the question stays on screen as context): eyebrow "QUERY" (mono 18px, 0.12em, ink-2) at left:96px top:140px; box at left:96px top:170px width:1000px height:64px, background paper #F6F1E8, border 2px solid rule #D9D1C2, border-radius 2px; text "why did my vpn token expire after the sso change" JetBrains Mono 26px ink, left padding 24px, vertically centred.
- Beat label (the muted-viewing caption of each beat, frames 2-5): a 64px x 3px vermilion #B8391F bar at left:96px top:846px, and the label text below it at left:96px top:870px, Fraunces Variable 54px, weight 380, line-height 1.1, letter-spacing -0.015em, ink, single line (max width 1728px). It reveals once with a short rise (y 16 -> 0) + opacity, power3.out, ~0.6s. Nothing else sits below y=830 except the label.
- Diagram zone: x 96..1824, y 260..800. Diagrams reuse the site SVG geometry (viewBox 720x440 components) scaled uniformly; strokes 2px, ink-2 dashed arrows "6 6", dots/bars in rule #D9D1C2, hot in vermilion #B8391F or ink #16140F exactly like the site classes:
  - ex-eyebrow: mono, ink-2, 0.12em; ex-mono: mono ink; ex-small: mono ink-2; ex-body: Inter Tight ink.
  - ex-box: fill paper, stroke rule. ex-dashed: stroke-dasharray, no fill. ex-bar: fill rule; ex-bar-hot: fill ink. ex-dot: fill rule; ex-dot-hot: fill vermilion. ex-query: fill vermilion. ex-track: fill rule; ex-fill: fill vermilion. ex-arrow: no fill, stroke ink-2, dashed. ex-node: fill paper stroke rule; ex-node-lit: stroke ink. ex-link: no fill, stroke vermilion. ex-hub: fill paper stroke rule; ex-hub-lit: stroke vermilion.
- Corners 2px everywhere. Never a shadow, glow, gradient, blur, ✱ mark, emoji or icon font. Vermilion is the signal colour — the one moving/hot element and the label bar; it never sets body copy.
- Motion grammar: power3.out entrances (0.5-0.8s), linear only for progress fills and typing; stagger 0.08-0.15s; no bounce, no rotation, no camera moves, no idle drift. Reveals paced across the frame; the frame ends on a still, fully readable hold.

## Brand adaptation (READ FIRST — the frontmatter is the source of truth)

This is the **code-editorial** preset remixed onto the captured brand. The YAML frontmatter above (colors · typography · components) is **normative and already correct — use it verbatim.** The prose below is the ORIGINAL preset's intent; read it THROUGH the frontmatter:

- **Fonts** — already set to **Fraunces Variable** (display) / **Inter Tight Variable** (body); ignore any preset font name lingering in prose.
- **Colors** — use the frontmatter hex; preset color NAMES in prose (e.g. "cobalt", "cream") mean the remapped brand values.


## Overview

Code editorial at frame scale is a **warm-editorial brand book come to life** — the register of a literary
imprint or a research note. The thesis is three colors: **cream is the ground, ink is the voice,
coral is the voltage** — and a fourth (warm navy) only where code shows itself. Every surface is
**warm cream** (never pure white, never cool gray); content gathers on a **tile** surface half a
step darker — the demarcation is a half-step, never a hard contrast. Elevation is a **1px hairline**
ink border at low alpha plus, rarely, one soft warm shadow. There are no heavy drops, no glows, no
gradients on content.

Three editorial voices, each in its own face: **Fraunces Variable** carries every display moment — covers,
headlines, pull-quotes, big stat numerals — at large display sizes with gentle negative tracking;
its **italic** is the expressive register. **Fraunces Variable** carries body, leads, card titles, buttons, and
UI chrome. **JetBrains Mono Variable** carries the indexical layer — kickers, technical labels, the code
window, status strips. Switching a voice's face collapses the register: a sans headline or a serif
label reads as a different brand.

**Key characteristics at frame scale:**

- **Cream / ink / coral trinity** + a warm-navy code surface; cream is the default ground, ink the voice, coral the scarce voltage.
- **Fraunces Variable** (sentence case, negative-tracked) for all display; **Fraunces Variable** body/chrome; **JetBrains Mono Variable** index + code.
- **Hairline elevation** — a 1px low-alpha ink border + at most one soft warm shadow. No heavy drop, glow, or gradient.
- **Coral is rationed** — at most ONE coral moment per frame (CTA, inline link, OR full-bleed band); coral never sets a headline or a body run.
- **Density is free** — fill the frame as the content wants; a frame may stand on a single focal or carry a dense, layered composition.
- **The ✱ coral spike** opens kickers; warm navy is reserved for the code/terminal surface.

## The Frame

### Frame Craft Bar

Eyeball tests gate every frame before any structural check:

- **Squint** — one Fraunces Variable display moment dominates at 3–6× its neighbor.
- **Trinity** — cream/tile ground, ink text, coral exactly **once**; warm navy only on the code surface; no cool gray / pure white / fourth hue.
- **Type** — Fraunces Variable sentence-case display (negative-tracked); Fraunces Variable 400 body; JetBrains Mono Variable kickers (uppercase 0.16em, coral ✱) + code.

- **Primary:** 1920×1080 (16:9). Display authored in **`cqw`** (`px ÷ 1920 × 100 = cqw`).
- **Vertical:** 1080×1920 (9:16). **Square:** 1080×1080 (1:1).
- **Safe area:** `slide-pad` ~4.2cqw; the kicker/mono chrome sit inside it.

**The container law (load-bearing).** Every frame ground sets `container-type: size`; ALL
frame-relative units are `cqw`/`cqh` against it — never `vw`. Hairlines stay 1px; card radii stay
6/8/12px; the warm-paper reading must survive every ratio.

## Colors

Tokens identical to the source. Default ground `{colors.cream}`; content gathers on
`{colors.tile}` / `{colors.tile-strong}` (half-step warm steps, never a hard contrast).
**Headlines & body:** `{colors.ink}` on cream/tile; `{colors.cream}` on navy. **Coral**
(`{colors.coral}`) is the scarce voltage — one moment per frame (CTA, inline link, or full-bleed
band), never body text, never a card fill. **Warm navy** (`{colors.navy}` / `navy-soft` /
`navy-elev`) is the code / terminal / dark-card surface — a structural anchor, not a fourth brand
hue. **No cool grays, no pure white, no pure black.**

**Fixed syntax colors (decoration, NOT remixable brand hues).** When a code line is hand-set rather
than rendered by a `code-*` block, keywords are coral, strings are **teal `#5DB8A6`**, numbers are
**amber `#E8A55A`**; status reads success `#5DB872` / warn `#C64545`. These track the code surface,
not the brand trinity — keep them out of the brand palette.

## Typography

Two ramps. The **reading/chrome ramp** (Fraunces Variable `body` 1.5cqw / `lead` 2.08cqw weight 400; JetBrains
Mono `kicker`/`mono-label` in px) carries copy + chrome; the **display ramp** (Fraunces Variable `headline` 4.6cqw
→ `display-cover` 9.9cqw, weight 400, negative-tracked) carries every headline + stat.

- **Legibility floor:** any load-bearing line ≥ **1.4cqw**; mono px labels are chrome only.
- **Fit-to-measure:** size the headline to its length. Cap the block at **≤ 78cqw**; ≤3 words → `display-cover`; 4–6 → `display`; 7+ → `headline`. Reserve the 7.3–9.9cqw tier for cover / statement / stat.
- **Fraunces Variable display is sentence case** (NOT title case, NOT uppercase), weight 400, negative-tracked (−0.012..−0.028em); reach for **italic** when the line is a stance or a definition. **Fraunces Variable body** sentence case weight 400. **JetBrains Mono Variable** kickers UPPERCASE 0.16em with the coral ✱. No uppercase serif, no sans headline, no serif label.

## Depth & Surface

Hairline elevation:

- **1px hairline** ink border at ~12% alpha is the primary lift (cream@14% on navy).
- **One soft warm shadow** (`0 1px 3px ink@8%, 0 4px 16px ink@4%`) — used rarely, never heavy.
- **Half-step surface** — a `{colors.tile}` block on cream reads elevated by the warm step, not by a cast shadow.

**Ceiling:** no heavy drop shadow, no glow, no gradient on content, no tilt. The system has no light
to emit; it reads by warmth and hairline.

## Shapes

- **6px** small chrome, **8px** cards / code surface, **12px** large cards / quote frames, **9999px** true pills only. No square corners, no heavy rounding; the editorial register is gently rounded, never hard.

## Components

- **card-hairline** — the editorial content card (hairline + one soft shadow). **section-rule** — the only separator (1px, coral may draw on).
- **kicker-spike** — the ✱ coral eyebrow. **coral-callout** — the one voltage moment (CTA / inline link / full-bleed band).
- **number-lockup** — Fraunces Variable figure + mono unit (the PR `+N / −M`, `200K`, file counts). **pull-quote** — Fraunces Variable italic + cite (a commit message / reviewer line).
- **code-surface** — the warm-navy code / terminal surface; the code itself comes from the **`code-*` registry blocks**, this owns the surface + mono chrome.
- **spike-mark** — the ✱ brand glyph, always coral.

## Frame Treatments

> Recipe: ground · container · composes · focal · chrome · accent · Fixed/Free · density.
> One coral moment per frame; open with a kicker-spike.

### 1 · Cover (identity · move: oversized Fraunces Variable · cream)

**Ground** `{colors.cream}`, `slide-pad`. **Composes** kicker-spike, display-cover, lead, mono-label index. **Focal** a 2–3 line Fraunces Variable `display-cover` (sentence case, ink) under a coral ✱ kicker. **Chrome** mono index strip (repo · branch). **Accent** the single coral ✱. **Fixed** Fraunces Variable 400 sentence case, hairline, cream ground. **Free** title, the mono index, layout + how full the frame runs. **Density** free.

### 2 · Statement (statement · move: single Fraunces Variable line · cream or navy)

**Ground** `{colors.cream}` (or `{colors.navy}` for gravity). **Composes** kicker-spike, display, optional lead. **Focal** one 2-line Fraunces Variable `display` carrying the change in a sentence — reach for **italic** if it's a stance. **Chrome** mono kicker. **Accent** none — the serif carries it (or one coral word). **Fixed** sentence-case serif. **Free** the line, ground, layout + density. **Density** free.

### 3 · Code Surface (code · move: warm-navy code window · the PR-critical frame)

**Ground** `{colors.cream}` framing a `{colors.navy}` **code-surface** (8px, cream@14% hairline, `navy-elev` title bar + filename in mono). **Composes** mono-label filename, the **`code-*` block** (code-diff / code-typing / code-snippet-_), optional `section-rule`. **Focal** the code panel — the diff / before→after / typed-on snippet. **Chrome** mono filename + status strip. **Accent** syntax coral/teal/amber inside the panel; one coral marker outside (e.g. a `+`/`−` gutter cue). **Fixed** warm-navy surface, mono code, hairline. **Free** which code-_ block, the code (from the diff), how large the panel runs. **Density** dense.

### 4 · Number / Impact (data · move: oversized figure · cream)

**Ground** `{colors.cream}`, `slide-pad`. **Composes** kicker-spike, number-lockup, lead/caption, optional `section-rule`. **Focal** a Fraunces Variable `number-hero` figure with a mono unit over a 1px rule — the PR impact (`+1,204 / −318`, `17 files`, `2.1× faster`). **Chrome** mono tag. **Accent** the figure in ink; at most one coral unit. **Fixed** serif figure + mono unit, hairline rule. **Free** the figures (from the script), tag, layout + density. **Density** free.

### 5 · Pull-quote (quote · move: Fraunces Variable italic · cream)

**Ground** `{colors.cream}`. **Composes** kicker-spike, pull-quote, tag-upper cite. **Focal** a Fraunces Variable **italic** `quote-pull` — a commit message, a reviewer line, or the thesis — with a small Fraunces Variable uppercase cite (author · role) beneath. **Chrome** mono kicker. **Accent** none, or one coral mark. **Fixed** Fraunces Variable italic quote + uppercase cite. **Free** quote, attribution, layout + density. **Density** free.

### 6 · Closing / CTA (closer · move: coral voltage · cream or navy)

**Ground** `{colors.cream}` (or `{colors.navy}`). **Composes** display sign-off, coral-callout, optional contributor row (`assets/<login>.png` avatars + mono names). **Focal** a short Fraunces Variable sign-off with the one **coral-callout** (the CTA or full-bleed band) and, for a "shipped-by" close, a row of hairline-ringed avatar chips. **Chrome** mono index. **Accent** the single coral voltage. **Fixed** one coral moment, hairline avatar rings, sentence-case serif. **Free** sign-off, who ships, layout + density. **Density** free.

## Composition Rules

### Do

- Stand every frame on the **warm cream floor**; gather content on a **half-step tile** surface.
- Set all display in **Fraunces Variable, sentence case**, negative-tracked; **Fraunces Variable 400** body; **JetBrains Mono Variable** kickers (uppercase, 0.16em, coral ✱) + code.
- Ration **coral to one moment per frame** — CTA, inline link, OR full-bleed band.
- Elevate with a **1px hairline** + at most one soft warm shadow; reserve **warm navy** for the code/terminal surface.
- Lead with **one clear focal**; open regions with a **kicker-spike**. Fill the frame as the content wants.
- Pair a Fraunces Variable figure with a **mono unit** for every stat; render code via the **`code-*` blocks** on the navy surface.

### Don't

- No pure white, no cool gray, no pure black; no fourth brand hue (navy is structural, syntax colors are decoration).
- No heavy drop shadow, glow, gradient on content, or tilt — hairline elevation only.
- No uppercase or title-case Fraunces Variable display; no sans headline; no serif label; no serif-set numeric unit.
- No two coral moments in one frame; coral never sets a headline or body run.
- Don't blow a headline past the measure — step the ramp down.

## Aspect-Ratio Behavior

| Treatment     | 16:9                    | 9:16                        | 1:1                    |
| ------------- | ----------------------- | --------------------------- | ---------------------- |
| Cover         | display left, index top | display top, index below    | display, index corner  |
| Statement     | line left/centered      | line stacked                | centered               |
| Code Surface  | panel framed in cream   | panel taller, fewer lines   | panel centered, square |
| Number/Impact | figure left             | figure centered, taller     | centered               |
| Pull-quote    | quote left              | quote stacked               | centered               |
| Closing/CTA   | sign-off + avatar row   | sign-off top, avatars below | centered, avatars wrap |

`slide-pad` holds on the short edge; re-step display above the 1.4cqw floor. The code surface keeps
its hairline + mono chrome on every ratio; the avatar row wraps rather than shrinks below legibility.

## Approved Real Entities

No real customers, logos, or vendors are defined in the source — render any such mark as a
placeholder. Contributor avatars come from the project's `assets/<login>.png` (staged from the PR's
people graph); the ✱ spike, hairlines, and the code surface are CSS-only and need no external imagery.

## Numerals & Claims (hard rule)

Never invent figures, stats, diffs, or counts at frame scale. Render slots as `— figure —`,
`{metric}`, `+N / −M`. Number-lockups, code panels, and impact stats carry placeholders until the
script (from the PR ingest) supplies real values. Branch names, file counts, and `+/−` totals trace
to the diff; commit/issue numbers are chrome.

## Pre-Render Self-Audit

- **Squint** — one Fraunces Variable display moment dominates.
- **Trinity** — cream floor + tile step + ink voice; coral appears exactly once; warm navy only on the code surface; no cool gray / pure white / fourth hue.
- **Type** — Fraunces Variable sentence-case display (negative-tracked); Fraunces Variable 400 body; JetBrains Mono Variable kickers (uppercase 0.16em, coral ✱) + code; ≥1.4cqw floor.
- **Depth** — 1px hairline + at most one soft warm shadow; no heavy drop / glow / gradient / tilt; 6/8/12px radii.
- **Code** — code rendered by a `code-*` block on the warm-navy surface; syntax coral/teal/amber; figures paired with a mono unit.
- **Fabrication** — every numeral / diff traces to the PR, else placeholder.

## Known Gaps

- **Motion intentionally out of scope.** frame.md specifies composition only. Code editorial's motion register — short cross-dissolves, no overshoot/bounce/elastic, coral the only "draw-on", numbers count up, code types on line by line — lives in the workflow's `motion-language.md` + `hyperframes-animation`, not here.
- **Fraunces Variable + Fraunces Variable + JetBrains Mono Variable ship as licensed local WOFF2 assets with this preset.** `build-frame.mjs` stages weights 400 + 700 into `assets/fonts/` and appends the exact `@font-face` block to the generated `frame.md`, so Studio, snapshots, and renders resolve them offline without a first-run Google Fonts fetch. Author display at **weight 400** (700 reads as a heavy bold, off-register), and treat italic as the browser-synthesized slant (acceptable for the pull-quote register; add a real italic face only if a project leans hard on it). Fraunces Variable is a warm old-style serif (low contrast, humanist); if it ever fails, fall to Georgia or another old-style serif — never to a sans. CJK: Noto Serif SC (display) / Noto Sans SC (body) / Noto Sans Mono CJK (code); the sentence-case warmth carries when the serif drops.
- **Syntax colors (teal `#5DB8A6` / amber `#E8A55A` / status) are fixed decoration**, declared in §Colors — they are NOT in the remixable `colors:` block, so a brand remix never repaints them.
- **The code itself is the `code-*` registry blocks**, not this preset — this preset owns only the surrounding warm-navy surface + mono chrome.
- **9:16 / 1:1 are guidance**; verify the legibility floor and that the cream/tile warmth + one-coral discipline hold per ratio.
