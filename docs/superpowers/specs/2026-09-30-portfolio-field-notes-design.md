# Portfolio rebuild: "Field Notes" design

Date: 2026-09-30 · Owner: P S Abhinav Krishna · Approved direction: fresh identity, light-first

## 1. Goal and success criteria

Rebuild the public portfolio and the private admin studio so the site reads as the work of an AI engineer who ships: current role at Ramco Systems (rTask.ai), Claude Certified Architect, verifiable credentials, real case studies. Replace the uncommitted charcoal-and-lime design with a new visual system while keeping every piece of existing content, the contact pipeline, and the admin security model.

Done means:

- Public site renders all sections from the content store with the new identity, at 1440px, in light and dark themes, with and without `prefers-reduced-motion`.
- Every scroll-driven section has a plain, linkable alternative (chapter links, stacked layout) and never traps scrolling.
- Admin studio works end to end locally against an in-process Postgres (PGlite): sign-in gate, authenticator enrolment, recovery codes, draft, preview, publish, history, inbox, analytics, image upload.
- `npm run typecheck`, `npm test`, `npm run build` pass. Playwright (headless, system Edge, 1440px) walks the public flows and the admin flow; screenshots reviewed by eye.
- ADMIN_SETUP.md lets the owner provision Neon Postgres, Google OAuth and Vercel env vars without help.

Out of scope this round: WebGL/3D, blog, mobile QA (standing rule), Vercel deployment (separate go/no-go after the gate).

## 2. Visual identity

| Token | Light (default) | Dark |
|---|---|---|
| `--paper` background | `#F6F1E8` warm off-white | `#12110F` |
| `--paper-2` raised surface | `#EFE8DC` | `#1A1816` |
| `--ink` text | `#16140F` | `#EFE9DE` |
| `--ink-2` secondary text | `#5B564B` | `#A69F91` |
| `--rule` hairlines | `#D9D1C2` | `#2B2825` |
| `--signal` accent | `#D6482B` vermilion | `#FF6A45` |
| `--signal-ink` text on accent | `#FFF7F2` | `#1A0C08` |

Contrast: body text ≥ 7:1 in both themes; secondary text ≥ 4.5:1; accent used for signals and links only, never for paragraphs.

Typography (self-hosted via `@fontsource-variable`, no runtime Google Fonts fetch):

- Display: Fraunces variable, weights 300–600, optical size on, `letter-spacing: -0.02em`, hero at `clamp(56px, 8vw, 132px)`, section titles at `clamp(36px, 4.5vw, 64px)`.
- Body: Inter Tight variable, 17px/1.6 body, 15px captions.
- Labels and numbers: JetBrains Mono variable, 12px uppercase, `letter-spacing: 0.12em`.

Layout: 12-column grid on a `min(1280px, 100% - 96px)` shell; hairline rules between sections; generous section padding (120px desktop); a visible left "margin note" column for eyebrows, figure numbers and chapter rails. Corners 2px, no drop shadows, borders instead. Imagery in muted frames with a 1px rule and a caption line in mono.

Anti-patterns to avoid: neon glow, gradient text, glassmorphism, percentage skill bars, emoji icons, marquee strips.

## 3. Page architecture (public `/`)

1. **Header** (sticky, paper with 1px rule): wordmark `abhinav.` in Fraunces; links Now · Work · Credentials · Toolkit · Journey; theme toggle; Ctrl+K search button; "Let's talk" button. Scroll progress hairline along the top edge.
2. **Hero**: mono status line with live dot ("Now · Project Trainee, RXD · rTask.ai at Ramco Systems · Bengaluru"); display name across two lines; one-sentence thesis from `profile.tagline`; CTAs "See the work" and "Read the field notes" (About). Right/behind: an inline-SVG "signal field" of 24 horizontal hairlines whose control points bend toward the pointer and drift with scroll (GSAP scrub, ±12px). Reduced motion: static final frame. No 3D.
3. **Now** (`#now`): pinned two-column chapter on desktop ≥1024px. Left column fixed: company, title, dates, 3-sentence summary. Right column scrolls three highlight cards (from `experience[0].highlights`), each with a mono figure label ("01 / DELIVERY"), a metric line, and a two-sentence detail. Below 1024px or with reduced motion: plain stacked layout, no pin. Chapter links in the left column jump to each card.
4. **Work** (`#work`): featured case studies (`projects.filter(featured)`, 3 max) as full-width chapters with a sticky chapter rail (01/02/03, titles, progress line) on the left and the case study on the right: framed screenshot, title, summary, 3 tags, GitHub and demo links. Each chapter is reachable by `#work-<slug>`. Then **Project index**: filter chips by tag, grid of cards for all projects, "Jump to index" link at the top of Work.
5. **Credentials** (`#credentials`): badge wall of `certifications[]`: issuer mark (text lockup, no logos), title, issuer, date, "Verify ↗" link when `url` exists, score line when `score` exists. Anthropic exams first.
6. **About / Field notes** (`#about`): portrait in a framed figure with mono caption, `biography[]` paragraphs in a measure of 62ch, GitHub and LinkedIn links.
7. **Toolkit** (`#toolkit`): `skillGroups[]` as three columns; each skill is name + one-line `note` ("Python — RAG service, evaluation scripts"). No percentages.
8. **Journey** (`#journey`): vertical timeline mixing `experience[]` and `education[]` sorted by start date, mono dates in the margin column.
9. **Contact** (`#contact`): existing form and API unchanged in behaviour; redesigned. Direct email always visible.
10. **Footer**: wordmark, "Built with curiosity", links, privacy link, analytics opt-out control.
11. **Command palette** (Ctrl/⌘+K): search sections and projects; keyboard navigation; focus trap; Escape closes. Kept from the current build, restyled.

## 4. Motion system

Single engine: GSAP 3 + ScrollTrigger via `@gsap/react` `useGSAP` with `gsap.matchMedia()` for `(prefers-reduced-motion: no-preference) and (min-width: 1024px)`. Reusable primitives in `src/components/motion/`:

- `Reveal` (IntersectionObserver, 12px rise, 350ms, once) for headings and cards.
- `Pinned` (ScrollTrigger pin with deterministic height, `ScrollTrigger.refresh()` after fonts/images load) for Now.
- `ChapterRail` (progress line + active chapter from ScrollTrigger callbacks; also works as plain anchor links).
- `ScrollProgress` (top hairline).
- `SignalField` (hero SVG; pointer + scroll scrub; static in reduced motion).

Rules: no scroll-jacking, no wheel hijack, parallax only on decorative layers, `will-change` only while animating, everything readable with JavaScript disabled (server-rendered content, no opacity-0 defaults without JS).

## 5. Theme

`data-theme="light|dark"` on `<html>`, set before hydration by an inline script reading `localStorage.theme` then `prefers-color-scheme`. Toggle in the header persists the choice. `color-scheme` follows. Both palettes defined as CSS custom properties in `globals.css`.

## 6. Content model (v2)

Zod schema in `src/lib/content-schema.ts`, `.strict()`:

```
profile: { name, image, role, company, location, availability, tagline, metadataTitle, metadataDescription, github, linkedin }
contactEmail
biography: string[] (1–12)
experience: [{ company, title, team, location, start, end ('' = present), summary, highlights: [{ label, metric, detail }] (0–6) }] (0–10)
projects: [{ slug, title, summary, description, image, github, demo, tags[], featured: boolean, year }] (1–60)
skillGroups: [{ title, skills: [{ name, note }] }] (1–10)
certifications: [{ title, issuer, date, url, score }] (0–30)
education: [{ title, place, date, description }] (0–30)
copy: record<string,string>
```

`src/data/portfolio.ts` holds `defaultContent` v2 with all existing projects, biography, education and copy, plus the new experience entry (Ramco Systems, Project Trainee RXD, Aug 2026–present, with three highlights: Connectors delivery, Milvus BM25 migration, Jev routing evaluation; and a QA Intern entry Apr–Aug 2026) and certifications (Claude Certified Architect – Professional, Claude Certified Associate – Foundations, Claude 101, Claude Code 101, then the four existing Infosys/Udemy certificates with their Drive links). Skill percentages are dropped; each skill gets a short note.

Published rows that fail v2 parsing fall back to `defaultContent` and log once; no DB migration is needed because no database exists yet.

## 7. Admin studio (`/admin`)

Security model retained exactly: Google sign-in restricted to the owner e-mail with verified e-mail, TOTP enrolment with encrypted secret (AES-256-GCM), eight one-use recovery codes, 4-hour MFA session bound to the Google session id, atomic attempt limiting, same-origin checks, `no-store` and `noindex` on every response, `__Host-` cookie in production.

Changes:

- **Code shape**: split the one-line-per-function files into readable modules (`src/lib/admin/*.ts`, `src/components/admin/*.tsx`), same behaviour, comments only where a constraint is not obvious.
- **Missing pieces**: add `GET/POST /api/admin/inbox` (list saved messages; retry delivery), make `/api/contact` persist to `contact_inbox` when a database is configured (delivery `sent|pending|failed`), add `sharp` to dependencies, add ADMIN_SETUP.md.
- **Database adapter** (`src/lib/db.ts`): `DATABASE_URL` → Neon serverless. Otherwise, when `NODE_ENV !== 'production'` and `ADMIN_LOCAL_DB=true`, an in-process PGlite database persisted to `.local-db/` (git-ignored) with `scripts/schema.sql` applied on first open. Both expose the same tagged-template `sql` interface so routes do not change.
- **Development owner bypass**: when `NODE_ENV !== 'production'`, `VERCEL` is unset and `ADMIN_DEV_BYPASS=true`, `googleOwner()` returns a synthetic owner session. TOTP is still required, so the real MFA path is exercised locally. The bypass is compiled out of production by the three-way guard and documented as dev-only.
- **UI**: gate screens (setup, sign-in, enrol, verify, recovery) and the studio shell (sidebar: Content · Analytics · Inbox; top bar: draft state, Save draft, Preview, Publish with confirm). Content editor stays schema-driven (recursive) with human labels, per-field hints, image upload for `image` fields, move/remove/add for arrays, and section descriptions. Same tokens and type as the public site.
- **Draft preview** at `/admin/preview` renders the public page with a "Private draft" banner; owner-only.

## 8. Files

Keep: `src/lib/contact.ts`, `tests/contact.test.mjs`, `src/app/api/contact/route.ts` (extended), `scripts/schema.sql` (extended), `public/**` images, `src/components/CommandMenu.tsx` (restyled).

Replace: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/*` public components, `src/data/portfolio.ts`, `src/data/copy.json`, `src/lib/content-schema.ts`, `src/lib/db.ts`, admin components and lib, `README.md`.

Add: `src/components/motion/*`, `src/components/sections/*`, `src/components/ThemeToggle.tsx`, `src/lib/theme.ts`, `src/lib/admin/*`, `src/app/api/admin/inbox/route.ts`, `ADMIN_SETUP.md`, `tests/content-schema.test.mjs`, `tests/db-local.test.mjs`, `e2e/portfolio.e2e.mjs` (Playwright script, headless msedge, 1440px).

Remove: Tailwind (unused after the rewrite), `framer-motion` (replaced by GSAP), `react-icons` (inline SVG icon set instead).

## 9. Testing and verification

- Unit: node:test for contact handling (existing), content schema (v2 valid/invalid, fallback), local DB adapter (schema applies, draft/publish round trip, TOTP attempt limiter).
- E2E (Playwright, headless Edge, 1440×900, light and dark, motion and reduced-motion): hero renders; Now chapter links work; Work chapters reachable by hash; project filter; certification Verify links present; Ctrl+K search opens/closes with focus trap; contact form validation and success path against a stubbed SMTP; admin: setup screen without env, bypass sign-in, TOTP enrol (code generated with `otpauth` in the test), recovery-codes screen, save draft, preview banner, publish, inbox list, analytics loads, image upload round trip.
- Visual: screenshots of every section and every admin screen at 1440px, reviewed by eye for overflow, spacing, contrast.
- Build: `npm run typecheck`, `npm test`, `npm run build`, `npm audit`.

## 10. Deliberate trade-offs

- Light-first paper palette chosen over dark for distinctiveness; dark theme is a full peer, not an afterthought.
- GSAP replaces Framer Motion because ScrollTrigger pinning and scrubbing are the core need; one engine only.
- Fonts via npm packages because the corporate proxy blocks `next/font/google` downloads at build time.
- PGlite is a development convenience only; production uses Neon. The two share SQL, so behaviour differences are limited to Postgres features PGlite lacks (none used here: jsonb, CTEs, FILTER, `?` operator are supported).
