# Portfolio "Field Notes" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public portfolio with the "Field Notes" identity and make the admin studio work end to end locally, per the spec.

**Architecture:** Next 15 App Router stays. A server page loads content (Neon → PGlite → bundled defaults) and renders client section components that share CSS tokens and a small GSAP motion layer. The admin keeps its security model but is split into readable modules with an injectable `sql` interface so logic is unit-testable against PGlite.

**Tech Stack:** Next 15.5, React 19, TypeScript 5, GSAP 3.15 + @gsap/react, @fontsource-variable (Fraunces, Inter Tight, JetBrains Mono), zod 3, next-auth 4, otpauth, qrcode, sharp, @neondatabase/serverless, @electric-sql/pglite, node:test, Playwright (global install, msedge channel).

**Spec:** `docs/superpowers/specs/2026-09-30-portfolio-field-notes-design.md`

## Global Constraints

- Node 22.18+ locally (machine has 26). Dev server: `npx next dev -p 3111` (no Turbopack; it breaks font modules here).
- Fonts self-hosted via `@fontsource-variable/*` CSS imports; no `next/font/google`.
- One animation engine: GSAP. Remove `framer-motion`, `react-icons`, `tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs`.
- Tokens exactly as spec §2 (light `--paper #F6F1E8`, `--ink #16140F`, `--signal #D6482B`; dark `--paper #12110F`, `--ink #EFE9DE`, `--signal #FF6A45`; full table in spec).
- All `src/lib/**` modules imported by `tests/*.test.mjs` use relative imports and no `server-only` (node strip-types cannot resolve `@/` or tolerate `server-only`). Only erasable TS syntax (no enums, no parameter properties).
- Desktop-only visual QA at 1440×900 in headless Edge (`channel: 'msedge'`). No mobile viewports.
- Development-only code paths are guarded by `process.env.NODE_ENV !== 'production' && !process.env.VERCEL && process.env.<FLAG> === 'true'`.
- Ask the owner before `git commit`, `git push`, or deploy. Git identity for this repo must be `PSAbhinav <150921411+PSAbhinav@users.noreply.github.com>`.
- Never print `.env.local` contents.

## Review Focus

1. Published content in the database written by the old v1 schema (skill `proficiency` numbers, no `experience`) → site must fall back to `defaultContent` and log once, not 500. Test in Task 3.
2. `prefers-reduced-motion: reduce` → no pinned sections, no scrub, hero renders the static frame, content still fully visible. Test in Task 10 (e2e with `reducedMotion: 'reduce'`).
3. Hash navigation to `#work-<slug>` and `#now` on a fresh load → target visible under the sticky header (scroll-padding). Test in Task 10.
4. Admin publish with a stale `revision` (another tab saved) → 409 with the "reload" message, draft untouched. Test in Task 6.
5. Contact form when the database exists but SMTP is not configured → message saved with `delivery='pending'`, visitor sees the 503 copy, admin inbox shows it and can retry after SMTP is configured. Test in Task 7.

---

### Task 1: Dependencies and project scaffolding

**Files:**
- Modify: `package.json`, `next.config.ts`, `.gitignore`, `.env.example`
- Delete: `postcss.config.mjs`, `src/types/vendor.d.ts` (keep only if `portfolio-mailer` alias stays; it stays), `tsconfig.tsbuildinfo` (regenerated)

**Interfaces:**
- Produces: npm scripts `dev` (`next dev -p 3111`), `build`, `start`, `typecheck`, `test` (`node --experimental-strip-types --test tests/*.test.mjs`), `e2e` (`node e2e/run.mjs`).

- [ ] **Step 1: Update dependencies**

Run: `npm remove framer-motion react-icons tailwindcss @tailwindcss/postcss && npm install gsap@^3.15 @gsap/react@^2.1 @fontsource-variable/fraunces @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono sharp@^0.35 @electric-sql/pglite@^0.5`

- [ ] **Step 2: Config**

`next.config.ts`: keep `outputFileTracingRoot`; add `serverExternalPackages: ['@electric-sql/pglite', 'sharp']`; drop the `turbopack` key. Delete `postcss.config.mjs`. `.gitignore`: add `/.local-db/`. `.env.example`: append the admin block (see Task 8 for the exact keys) with empty values and one-line comments.

- [ ] **Step 3: Verify**

Run: `npm run typecheck` → passes (nothing imports removed packages yet except files replaced in later tasks; if it fails only on those files, proceed — Task 4/5 replace them).

### Task 2: Content model v2 and defaults

**Files:**
- Replace: `src/lib/content-schema.ts`, `src/data/portfolio.ts`, `src/data/copy.json`
- Test: `tests/content-schema.test.mjs`

**Interfaces:**
- Produces: `contentSchema` (zod), `type PortfolioContent`, `type Project`, `type Experience`, `type Certification`, `type SkillGroup`, `type Education`, `defaultContent: PortfolioContent`, `contactEmail: string`.
- Schema (all `.strict()`): as spec §6. Additional pins: `slug` matches `/^[a-z0-9-]{2,60}$/`; `year` is `z.string().max(20)`; `end: ''` means present; `highlights` max 6; `score` and `url` may be `''`.

- [ ] **Step 1: Write failing tests** in `tests/content-schema.test.mjs` (relative import `../src/lib/content-schema.ts`, `../src/data/portfolio.ts`):
  - `defaultContent parses` — `contentSchema.parse(defaultContent)` deep-equals input.
  - `v1 content is rejected` — object with `skillGroups[0].skills[0].proficiency: 90` and no `experience` → `safeParse().success === false`.
  - `slug rule` — project slug `"Bad Slug"` rejected.
  - `featured projects ≤ 3 in defaults` — `defaultContent.projects.filter(p=>p.featured).length === 3`.
  - `certifications order` — first two titles start with `"Claude Certified"`.

- [ ] **Step 2: Run** `npm test` → fails (module shape mismatch).

- [ ] **Step 3: Implement schema and defaults.** Default content values:
  - `profile`: name `P S Abhinav Krishna`; role `Project Trainee, RXD`; company `Ramco Systems`; location `Bengaluru, India`; availability `Open to conversations`; tagline `I build AI-first software that has to work on a Monday morning: helpdesk agents, retrieval pipelines and the tests that keep them honest.`; metadataTitle `P S Abhinav Krishna — AI engineer`; metadataDescription `Portfolio of P S Abhinav Krishna: Project Trainee at Ramco Systems on rTask.ai, Claude Certified Architect, builder of practical AI and full-stack applications.`; github/linkedin/image unchanged from current file.
  - `experience[0]` Ramco Systems / Project Trainee, RXD / team `rTask.ai product engineering` / Bengaluru / start `2026-08` / end `''` / summary: `rTask.ai is Ramco's AI-first, multi-tenant helpdesk. I work across its React/TypeScript front end, Node.js API and Python retrieval service, shipping fixes and features test-first.` / highlights:
    1. label `01 / Delivery`, metric `35+ merge requests · 65-file delivery MR`, detail `Consolidated a 23-branch Knowledge Base Connectors UI batch into one delivery merge request (+7,154/−1,231 lines) with the 3,100+ test Vitest suite green.`
    2. label `02 / Search`, metric `92/92 collections · 0 failures`, detail `Ran the production Milvus BM25 hybrid-search migration for the retrieval service, driven by a bash CLI written for the run.`
    3. label `03 / Evaluation`, metric `50 cases · 100% routing accuracy`, detail `Benchmarked TypeSafe Jev as an LLM-free intent router: p95 latency under 660 ms and about two-thirds of intents routable without an LLM call.`
  - `experience[1]` Ramco Systems / QA Intern / team `Quality engineering` / start `2026-04` / end `2026-08` / summary `Designed and executed test cases for the KPI and OKR set-up modules, then built a Playwright (TypeScript) regression framework with fixtures, page objects and a ten-suite KPI pack.` / highlights `[]`.
  - `projects`: the eight current projects with `slug` (kebab of title), `summary` (one sentence ≤ 120 chars, write it from the existing description), `description` (existing text), `featured: true` for StockPro, NexusCommand, TaskManager; `year` from the resume where known (`2025` StockPro, `2026` Nexus, `2026` TaskManager), else `''`.
  - `skillGroups` (name + note, no numbers): `Languages` — Python `RAG service, migration scripts, evaluation harnesses`; TypeScript `helpdesk front end and Node.js API`; C `systems fundamentals`; SQL `PostgreSQL, MongoDB queries`. `Product engineering` — React `design-system components, Vite, Vitest`; Node.js & Express `API routes, Jest suites`; FastAPI `retrieval endpoints`; Playwright `end-to-end and regression packs`. `AI systems` — Claude API & Agent SDK `agentic workflows, tool use`; RAG `hybrid BM25 + vector, Milvus, ChromaDB`; Prompt engineering `system prompts, guardrails, evals`; Claude Code `daily driver for delivery`.
  - `certifications`: Claude Certified Architect – Professional / Anthropic / `2026-09` / credly `0ea1a99f-14a8-4c43-ba6a-e22b0db21da3` / score `825 / 1000`; Claude Certified Associate – Foundations / Anthropic / `2026-09` / credly `0085865c-3e09-404e-9dec-2e75f49da002` / `835 / 1000`; Claude 101 / Anthropic Academy / `2026-09` / `''` / `''`; Claude Code 101 / Anthropic Academy / `2026-09`; then ML Using Python (Infosys Springboard, `2025-05`), Project Management with Agile (`2024-11`), AI & LLM (Udemy, `2024-10`), UNIX & Linux OS Fundamentals (`2024-02`) with their existing Drive URLs.
  - `education`: current three entries (keep text; CGPA `8.85` to match the resume).
  - `copy.json`: only keys the new components use (see Tasks 4–5); each component references `copy[key]` with a literal fallback so a missing key never renders `undefined`.

- [ ] **Step 4: Run** `npm test` → content-schema tests pass.

### Task 3: Content store fallback and database adapter

**Files:**
- Replace: `src/lib/db.ts`, `src/lib/content-store.ts`
- Create: `src/lib/db-local.ts`, `src/lib/sql-types.ts`
- Modify: `scripts/schema.sql` (add `contact_inbox.error text NOT NULL DEFAULT ''`, `content_history.revision integer`)
- Test: `tests/db-local.test.mjs`

**Interfaces:**
- `sql-types.ts`: `export type Sql = <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>`.
- `db-local.ts`: `export async function openLocalDb(dir: string): Promise<Sql>` — PGlite persisted at `dir`, applies `scripts/schema.sql` once per process (idempotent SQL), returns a tagged template that converts `${}` to `$1..$n` and returns `rows`. `export function localDbEnabled(): boolean` → the three-way guard with `ADMIN_LOCAL_DB`.
- `db.ts`: `export function db(): Sql` (Neon when `DATABASE_URL`), `export async function sqlClient(): Promise<Sql>` (Neon, else local when enabled, else throws `'Database is not configured'`), `export function databaseConfigured(): boolean`. All routes switch to `await sqlClient()`.
- `content-store.ts`: `getPublishedContent()` returns defaults when no database or when parse fails (`console.warn` once per process); `getDraft()` returns `{ content, revision }` with the same fallback for `content`.

- [ ] **Step 1: Write failing tests** in `tests/db-local.test.mjs` using a temp dir under `os.tmpdir()`:
  - `schema applies and content row exists` — `SELECT id FROM portfolio_content` → one row id 1.
  - `jsonb round trip` — update draft with `JSON.stringify({a:1})::jsonb`, read back object.
  - `jsonb ? operator works` — `SELECT '["x"]'::jsonb ? 'x' AS ok` → true (needed by recovery codes).
  - `content-store falls back on v1 rows` — set `published` to a v1-shaped object, call `getPublishedContent` with the local sql injected → equals `defaultContent`. (Export `getPublishedContentWith(sql: Sql | null)` from content-store for this; `getPublishedContent()` wraps it.)

- [ ] **Step 2: Run** → fails. **Step 3: Implement.** **Step 4: Run** → passes.

### Task 4: Design foundation, theme, motion primitives

**Files:**
- Replace: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/site.css`, `src/styles/admin.css` (all `@import`ed from `globals.css` in that order), `src/lib/theme.ts`, `src/components/ThemeToggle.tsx`, `src/components/motion/gsap.ts`, `useReducedMotion.ts`, `Reveal.tsx`, `Pinned.tsx`, `ChapterRail.tsx`, `ScrollProgress.tsx`, `SignalField.tsx`, `src/components/Icons.tsx`

**Interfaces:**
- `theme.ts`: `export const THEME_SCRIPT: string` (inline, sets `document.documentElement.dataset.theme` from `localStorage.theme` ∈ `light|dark` else `matchMedia('(prefers-color-scheme: dark)')`); `export function setTheme(theme: 'light'|'dark'): void` (writes attribute + localStorage).
- `layout.tsx`: imports the three fontsource CSS files and `globals.css`; `<html lang="en" suppressHydrationWarning>`; `<script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}}>` first in `<body>`; `metadata` from `defaultContent.profile`.
- `tokens.css`: `:root` and `[data-theme="dark"]` custom properties exactly per spec §2, plus `--font-display: 'Fraunces Variable'`, `--font-body: 'Inter Tight Variable'`, `--font-mono: 'JetBrains Mono Variable'`, spacing scale `--s1: 4px … --s12: 120px`, `--shell: min(1280px, 100% - 96px)`, `--header-h: 76px`; `html { scroll-padding-top: calc(var(--header-h) + 24px) }`.
- `base.css`: reset, type scale classes `.display-1` (`clamp(56px,8vw,132px)`, Fraunces 300, `letter-spacing:-0.02em`, `line-height:.92`), `.display-2` (`clamp(36px,4.5vw,64px)`), `.eyebrow` (mono 12px uppercase `letter-spacing:.12em` colour `--ink-2`), `.shell`, `.rule`, `.button`, `.button-primary`, `.button-ghost`, `.frame` (1px `--rule` border, 2px radius, `--paper-2` background, mono caption slot `.frame-caption`), `.sr-only`, `:focus-visible` (2px `--signal` outline, 4px offset), `::selection`.
- `gsap.ts`: `export { gsap, ScrollTrigger, useGSAP }` after `gsap.registerPlugin(ScrollTrigger, useGSAP)` guarded by `typeof window !== 'undefined'`.
- `useReducedMotion(): boolean` (matchMedia, updates on change).
- `Reveal({ as?: keyof JSX.IntrinsicElements; delay?: number; children })` — IntersectionObserver once, adds class `is-in`; CSS: `.reveal { opacity:1 }` by default; only `html.js .reveal:not(.is-in) { opacity:0; transform:translateY(12px) }` with 350ms transition; reduced motion → no transform. `layout.tsx` sets `html.js` via `THEME_SCRIPT` (`document.documentElement.classList.add('js')`).
- `Pinned({ id, rail: ReactNode, children, minWidth?: 1024 })` — grid `320px 1fr`; with `gsap.matchMedia()` `(prefers-reduced-motion: no-preference) and (min-width:1024px)` pins `rail` for the section's height via ScrollTrigger (`pin: true, pinSpacing: false, start: 'top '+headerH, end: 'bottom bottom'`); otherwise plain stacked flow.
- `ChapterRail({ chapters: {id,label,index}[], activeId })` — anchor list with a progress line; `activeId` supplied by parent from ScrollTrigger `onToggle` or IntersectionObserver; works as plain links without JS.
- `ScrollProgress()` — 2px `--signal` bar at top scaled by scroll fraction (`transform: scaleX`), hidden under reduced motion.
- `SignalField({ lines?: 24 })` — inline SVG 800×600, `lines` `<path>`s; on pointer move within the hero, control points bend toward the pointer (`gsap.quickTo`), and a ScrollTrigger scrub adds `y` drift ±12px; reduced motion or no JS → straight lines rendered server-side.
- `Icons.tsx`: `ArrowUpRight`, `ArrowDown`, `Search`, `Sun`, `Moon`, `Close`, `External`, `Github`, `Linkedin`, `Mail` — 20px stroke icons, `aria-hidden`.

- [ ] **Step 1: Implement files above.** **Step 2: Verify** `npm run typecheck` passes and `npx next dev -p 3111` serves `/` (public sections come in Task 5; a temporary `page.tsx` rendering `<h1 className="display-1">` is acceptable for this step).

### Task 5: Public sections

**Files:**
- Replace: `src/app/page.tsx`, `src/components/Portfolio.tsx`, `src/components/PortfolioContext.tsx` (keep API: `usePortfolio()` returns `PortfolioContent`), `src/components/CommandMenu.tsx` (restyle; search source = sections + projects), `src/components/Analytics.tsx` (section ids list → `home, now, work, credentials, about, toolkit, journey, contact`; same in `/api/analytics` allow-list)
- Create: `src/components/site/Header.tsx`, `Hero.tsx`, `Now.tsx`, `Work.tsx`, `ProjectIndex.tsx`, `Credentials.tsx`, `About.tsx`, `Toolkit.tsx`, `Journey.tsx`, `Contact.tsx` (move existing logic; restyle), `Footer.tsx`
- Delete: `src/components/{About,Skills,Timeline,Projects,Navbar,Footer,InteractiveArt,RevealEffects,ScrollShowcase,ScrollProgress}.tsx` (old)

**Interfaces:**
- `page.tsx`: `export const dynamic = 'force-dynamic'`; `export async function generateMetadata()` from published `profile`; renders `<PortfolioProvider content><Portfolio/><Analytics/></PortfolioProvider>`.
- Section ids and order: `home, now, work, credentials, about, toolkit, journey, contact`. Header links: Now · Work · Credentials · Toolkit · Journey; buttons: ThemeToggle, CommandMenu trigger (`Ctrl K`), "Let's talk" → `#contact`.
- `Hero`: status line `{copy.status_prefix ?? 'Now'} · {profile.role} · {profile.company} · {profile.location}` with a live dot; `<h1 className="display-1">` name on two lines (`P S Abhinav` / `Krishna`); tagline; CTAs `See the work` (`#work`), `Read the field notes` (`#about`); `<SignalField/>` behind the right half; mono figure caption `FIG. 01 — SIGNAL FIELD`.
- `Now`: `<Pinned id="now" rail={…}>` rail = eyebrow `01 / NOW`, company, title, dates (`formatRange(start,end)` → `Aug 2026 — Present`), summary, chapter links to `#now-1..3`; children = highlight cards `article#now-{i}` with `.eyebrow` label, `.metric` (Fraunces 40px), detail. Uses `experience[0]`.
- `Work`: featured chapters `section#work-{slug}` each: framed image (`next/image`, `sizes="60vw"`), eyebrow `0{i} / {tags[0]}`, `h3` title (display-2), summary, tags, links `GitHub ↗` and `Live ↗` when demo. Left `ChapterRail` sticky (`position: sticky; top: calc(var(--header-h)+24px)`), no GSAP pin needed. Link `Jump to the project index ↓` (`#index`). Then `ProjectIndex` (`section#index`): chips from unique tags (`All` first), `aria-pressed`, grid of cards (image, title, summary, links).
- `Credentials`: grid of `article.badge` per certification: eyebrow issuer, title (Fraunces 24px), mono date (`formatMonth('2026-09')` → `Sep 2026`), score line when present, `Verify ↗` when url. Anthropic ones get a `.badge-primary` variant (signal-coloured rule).
- `About`: framed portrait (caption `FIG. 02 — FIELD NOTES`), biography paragraphs `max-width: 62ch`, links GitHub/LinkedIn.
- `Toolkit`: three columns, `dl` per group: `dt` name, `dd` note.
- `Journey`: `ol` of entries merged from experience (dates from `start`/`end`) and education (parse `YYYY - YYYY` from `date`), sorted descending by start year; mono date in a left column, title, place/company, description/summary.
- `Contact`: existing form logic verbatim (`/api/contact`), new markup/classes; direct mailto always visible.
- `Footer`: wordmark, `© {year} P S Abhinav Krishna`, links, `Privacy` (`/privacy`), analytics opt-out button (sets `localStorage['portfolio-analytics-opt-out']='true'` and dispatches `portfolio-analytics-opt-out`).
- Date helpers in `src/lib/format.ts`: `formatMonth(ym: string): string`, `formatRange(start: string, end: string): string`.

- [ ] **Step 1: Implement** all sections and styles in `site.css` (section padding 120px, hairline rules between sections, margin-note column `grid-template-columns: 240px 1fr` on ≥1024px).
- [ ] **Step 2: Verify** `npm run typecheck`, dev server renders every section; check in browser screenshot at 1440 that nothing overflows.

### Task 6: Admin library split and local security test

**Files:**
- Create: `src/lib/admin/auth-policy.ts` (move), `auth.ts` (next-auth options + `googleOwner()` with dev bypass), `access.ts` (`adminOwner`, `sameOrigin`, `privateJson`, `MFA_COOKIE`), `crypto.ts` (move), `totp.ts`, `content.ts`, `inbox.ts`
- Delete: `src/lib/{auth,auth-policy,admin-access,admin-crypto}.ts`
- Modify: all `src/app/api/admin/**` and `api/auth/**` routes to import from `@/lib/admin/*` and use `await sqlClient()`
- Test: `tests/totp.test.mjs`, `tests/content-actions.test.mjs`

**Interfaces:**
- `totp.ts` (pure, relative imports, no server-only): `export async function beginEnrollment(sql: Sql, sub: string): Promise<{ secret: string } | null>` (null when already enabled); `export async function verifyCode(sql: Sql, sub: string, code: string, now?: number): Promise<{ ok: true; recoveryCodes: string[] } | { ok: false; status: 400|429; error: string }>`; `export function totpFor(secret: string)`; recovery code format `/^[a-f0-9]{8}-[a-f0-9]{8}$/`. Encryption key read via `crypto.ts` from `ADMIN_ENCRYPTION_KEY`.
- `content.ts`: `export async function saveDraft(sql, content: unknown, revision: number): Promise<{ revision: number } | { error: string; status: 400|409 }>`; `export async function publishDraft(sql, revision: number): Promise<{ revision: number } | { error: string; status: 409 }>` (also inserts into `content_history` with revision).
- `inbox.ts`: `export async function saveMessage(sql, m: ContactMessage, delivery: 'sent'|'pending'|'failed', error?: string): Promise<string>`; `export async function listMessages(sql): Promise<InboxRow[]>` (newest first, max 200); `export async function markDelivery(sql, id: string, delivery, error?)`.
- `auth.ts`: `export function authConfigured(): boolean` (Google id+secret+NEXTAUTH_SECRET+ADMIN_ENCRYPTION_KEY and (DATABASE_URL or local db enabled)); `export function devBypassEnabled(): boolean` (three-way guard with `ADMIN_DEV_BYPASS`); `googleOwner()` returns `{ ownerSid: 'dev-sid', ownerSub: 'dev-owner', user: { email: OWNER_EMAIL } }` when bypass is on.

- [ ] **Step 1: Write failing tests** (set `process.env.ADMIN_ENCRYPTION_KEY` to a 32-byte base64 in the test; use `openLocalDb(tmp)`):
  - `enroll then verify with a live code enables TOTP and returns 8 recovery codes` (generate the code with `otpauth` from the returned secret).
  - `reused counter is rejected` (same code twice → `ok:false, 400`).
  - `sixth wrong attempt in window → 429`.
  - `recovery code works once` (use one, then reuse → 400).
  - `saveDraft with stale revision → 409`; `publishDraft after save → revision increments and content_history has 1 row`.

- [ ] **Step 2: Run** → fails. **Step 3: Implement** by moving logic out of `security/route.ts` and `content/route.ts` into these modules; routes become thin. **Step 4: Run** → passes; `npm run typecheck` passes.

### Task 7: Inbox API and contact persistence

**Files:**
- Create: `src/app/api/admin/inbox/route.ts`
- Modify: `src/app/api/contact/route.ts`, `src/lib/contact.ts` (add optional `onResult?: (message, outcome: 'sent'|'failed'|'unconfigured') => Promise<void>` parameter to `handleContact`, called after the send attempt or the 503 path)
- Test: extend `tests/contact.test.mjs` with `onResult receives 'unconfigured' when SMTP is missing` and `'failed' when the transport throws`.

**Interfaces:**
- `GET /api/admin/inbox` → `{ messages: InboxRow[] }` (owner only). `POST` body `{ id }` → re-sends via the same nodemailer transport factory (`src/lib/mailer.ts`: `export function createTransport()` and `export function smtpConfigured(): boolean`, extracted from the contact route) and updates delivery; `{ ok: true, delivery }`.
- Contact route: when `databaseConfigured()`, persist every valid message with the outcome (`sent`, `pending` for unconfigured SMTP, `failed`); persistence errors are logged, never surfaced.

- [ ] Steps: failing tests → run → implement → run → `npm run typecheck`.

### Task 8: Admin studio UI and setup guide

**Files:**
- Replace: `src/components/admin/AdminPanel.tsx`, `ContentEditor.tsx`, `StatsDashboard.tsx`; `src/app/admin/page.tsx`, `src/app/admin/preview/page.tsx`
- Create: `src/components/admin/AdminGate.tsx`, `StudioShell.tsx`, `Inbox.tsx`, `ADMIN_SETUP.md`, `scripts/setup-db.mjs` (rewrite: applies `schema.sql` to `DATABASE_URL` using `@neondatabase/serverless`; prints table list)
- Styles in `src/styles/admin.css`

**Interfaces:**
- `AdminPanel({ configured, devBypass })` state machine stages `loading|setup|signin|enroll|verify|recovery|ready|error` (same transitions as today). `AdminGate` renders the non-ready stages; `StudioShell` renders sidebar (Content · Analytics · Inbox), top bar (draft state text `Unsaved changes` / `All changes saved`, buttons `Save draft`, `Preview draft ↗`, `Publish` → inline confirm `Publish this version` / `Keep as draft`).
- `ContentEditor` stays recursive; labels via `humanize(key)`; section descriptions map (`experience: 'Roles, dates and the highlights shown in the Now chapter.'` etc.); `featured` renders a checkbox; `image` fields get the upload control; textarea for keys matching `/description|summary|tagline|detail|biography|message/` or values > 100 chars.
- `.env.example` keys: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_ENCRYPTION_KEY, ADMIN_LOCAL_DB, ADMIN_DEV_BYPASS`.
- `ADMIN_SETUP.md` sections: 1 Neon (create project, copy pooled connection string, run `node scripts/setup-db.mjs`), 2 Google OAuth (consent screen external → test user = owner email; web client; redirect URIs `http://localhost:3111/api/auth/callback/google` and `https://<domain>/api/auth/callback/google`), 3 Secrets (`openssl rand -base64 32` for both `NEXTAUTH_SECRET` and `ADMIN_ENCRYPTION_KEY`; PowerShell alternative `[Convert]::ToBase64String((1..32 | % { Get-Random -Max 256 }) -as [byte[]])`), 4 Vercel env vars (Production + Preview), 5 First sign-in and authenticator enrolment, 6 Recovery, 7 Local development (`ADMIN_LOCAL_DB=true`, `ADMIN_DEV_BYPASS=true`, never on Vercel).

- [ ] **Step 1: Implement.** **Step 2: Verify** with `.env.local` containing only `ADMIN_LOCAL_DB=true`, `ADMIN_DEV_BYPASS=true`, `NEXTAUTH_SECRET=<random>`, `ADMIN_ENCRYPTION_KEY=<32-byte base64>`, `NEXTAUTH_URL=http://localhost:3111`: `/admin` shows enrol → verify → recovery → studio; save/preview/publish round-trips; `/` shows published content.

### Task 9: README, cleanup, build

**Files:** `README.md` (rewrite for the new stack, dev commands, admin pointer, QA commands), delete stale files, `npm audit`.

- [ ] `npm run typecheck && npm test && npm run build` all pass. `git status` reviewed: no `.env.local`, no `.local-db/`.

### Task 10: End-to-end QA (Playwright, headless Edge, 1440×900)

**Files:**
- Create: `e2e/run.mjs` (starts `next dev -p 3111` if not running, imports Playwright from the global path or `PLAYWRIGHT_PATH`), `e2e/portfolio.e2e.mjs`, `e2e/admin.e2e.mjs`, screenshots to `e2e/shots/` (git-ignored).

**Checks (assert, then screenshot):**
- Public, light + dark, motion on: hero `h1` visible; `#now` rail is pinned (rail `getBoundingClientRect().top` constant across two scroll positions on desktop); `#work-stockpro-ai-stock-dashboard` reachable by hash with top ≥ header height; `#index` chips filter (clicking `AI` hides a non-AI card); Credentials has two `Verify` links to credly; Ctrl+K opens dialog, focus inside, Escape closes and restores focus; theme toggle flips `data-theme` and persists after reload; contact validation error on 3-char message; contact success with a stub (env `SMTP_*` unset → expect 503 copy visible and mailto fallback link present).
- Reduced motion (`reducedMotion: 'reduce'`): no element has `position: fixed` inside `#now`; all sections visible; no console errors.
- Admin (with the Task 8 `.env.local`): setup screen when env missing (run a second server on 3112 without env, or assert `configured=false` path by unsetting in a subprocess); with bypass: enrol → generate code with `otpauth` from the shown setup key → recovery screen → studio; edit `profile.tagline` → Save draft → `/admin/preview` shows banner and new tagline → Publish → `/` shows new tagline; Inbox lists a message posted to `/api/contact`; Analytics tab loads without error; image upload of `public/Profile_Pic.jpg` returns `/api/media/<uuid>` that serves `image/webp`.
- Every screenshot reviewed by eye for overflow, overlap, contrast, spacing before declaring done.

- [ ] Run `npm run e2e` → all assertions pass; list screenshots in the final report.

### Task 11: Final review

- [ ] Fresh reviewer (Opus) reads the spec and the diff; findings fixed; `npm test`, `npm run build`, `npm run e2e` re-run. Report to owner with before/after screenshots and the deploy question.
