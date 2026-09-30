# P S Abhinav Krishna — portfolio

A Next.js 15 portfolio with the "Field Notes" identity: warm paper and ink, one vermilion signal colour, Fraunces / Inter Tight / JetBrains Mono, scroll-linked chapters that always have a plain alternative, and a private admin studio for editing content, reading analytics and answering contact messages.

Design spec: `docs/superpowers/specs/2026-09-30-portfolio-field-notes-design.md`. Implementation plan: `docs/superpowers/plans/2026-09-30-portfolio-field-notes.md`.

## Run it locally

Node.js 22.18 or newer.

```sh
npm ci
npm run dev        # http://localhost:3111
```

The dev script runs without Turbopack on purpose: on this machine Turbopack fails to resolve font modules. Fonts are self-hosted through `@fontsource-variable/*`, so no network access is needed at build time.

## Content

Bundled content lives in `src/data/portfolio.ts` (profile, experience, projects, skills, certifications, education) and `src/data/copy.json` (headings and interface copy). Everything is validated by the zod schema in `src/lib/content-schema.ts`. When a database is connected, published content from the admin studio replaces the bundled defaults; a row that fails validation falls back to the defaults with one warning in the server log.

## Sections and motion

Home → Now (pinned two-column chapter on desktop, stacked below 1024px or with reduced motion) → Work (three case studies with a sticky chapter rail, then a filterable project index) → Credentials → About → Toolkit → Journey → Contact.

- One animation engine: GSAP with ScrollTrigger, scoped by `gsap.matchMedia()` to desktop widths without `prefers-reduced-motion`.
- Reveal-on-scroll only hides content when JavaScript is present (`html.js`), so the page reads fully without it.
- Ctrl/⌘+K opens a searchable command palette; arrow keys move, Enter opens, Escape closes and returns focus.
- The theme toggle stores `light` or `dark` in `localStorage.theme`; the system preference is used until then.

## Admin studio

`/admin` is the owner's private studio: Google sign-in restricted to the owner address, authenticator (TOTP) verification with one-use recovery codes, draft → preview → publish content editing (every publish is recorded in `content_history`; a restore screen is not built yet), an anonymous analytics dashboard, and a contact inbox with delivery retry. Setup, including local development with an in-process Postgres and the development-only owner bypass, is documented in `ADMIN_SETUP.md`.

## Contact e-mail

Messages go to the address in `src/data/portfolio.ts` via authenticated SMTP (Gmail app password or any SMTP provider). Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and optionally `SMTP_FROM` on the server. When a database is configured every message is also saved to the inbox, including ones that could not be delivered, so nothing is lost while SMTP is unconfigured.

## Checks

```sh
npm run typecheck
npm test           # unit tests (contact handling, content schema, local database, TOTP, content actions)
npm run build
npm run e2e        # Playwright, headless Edge, 1440x900; screenshots in e2e/shots/
```

The end-to-end runner uses the globally installed Playwright package (or `PLAYWRIGHT_PATH`) and the system Edge browser; nothing is downloaded.

## Deployment

Vercel with a Node.js runtime (the contact, analytics and admin routes need a server). Set the environment variables from `.env.example` in the Vercel project before the first deploy. Never enable `ADMIN_LOCAL_DB` or `ADMIN_DEV_BYPASS` on Vercel; both are refused in production builds regardless.
