# Private studio setup

The studio at `/admin` lets you edit every section of the portfolio, preview a draft, publish it, read contact messages and see visitor analytics. It stays locked (the "Almost ready." screen) until the pieces below are in place.

Security model, for reference: sign-in is a passphrase that only you know; the server stores just its scrypt hash, and five wrong passphrases from one address lock sign-in for 15 minutes (the counter lives in the database, so it holds across every serverless instance). Every sign-in then needs a code from an authenticator app (the secret is stored encrypted with AES-256-GCM); eight one-use recovery codes cover a lost phone; five wrong codes lock verification for 15 minutes. An unlocked session lasts four hours and is bound to that passphrase sign-in, so each new sign-in asks for a fresh authenticator code. Signing out ends both.

You will set these environment variables (names only; values never go in git):

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon, step 1 (already connected in Vercel) |
| `ADMIN_SESSION_SECRET`, `ADMIN_ENCRYPTION_KEY`, `ADMIN_PASSPHRASE_HASH` | Generated, step 2 |
| `SITE_URL` (optional) | Your site origin; only needed if the same-origin check should use a fixed origin instead of the request's |
| `SMTP_USER`, `SMTP_PASSWORD` (+ optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`) | Contact e-mail, see README |

## 1. Neon Postgres

The Neon database is already connected to the Vercel project through the **Storage** integration, which provides `DATABASE_URL` to Production and Preview. You only need it locally to run the setup script:

1. In Vercel open **Storage → your Neon database → .env.local** (or the Neon console, **Connect**, with **Connection pooling** on) and copy the pooled connection string. It looks like `postgresql://user:password@ep-...-pooler.<region>.aws.neon.tech/neondb?sslmode=require`.
2. Put it in `.env.local` as `DATABASE_URL=...`.
3. Create or update the tables:

   ```sh
   node scripts/setup-db.mjs
   ```

   It prints the table list (`admin_login_attempts`, `admin_sessions`, `admin_totp`, `analytics_events`, `contact_inbox`, `content_history`, `portfolio_content`, `portfolio_media`). Re-running it is safe. (The sign-in route also creates `admin_login_attempts` on first use if it is missing.)

## 2. Secrets and passphrase

Choose a long passphrase (four or more unrelated words, or your password manager's generator). Then run:

```sh
node scripts/make-secrets.mjs "your passphrase"
```

It prints three lines and nothing else:

```
ADMIN_SESSION_SECRET=...
ADMIN_ENCRYPTION_KEY=...
ADMIN_PASSPHRASE_HASH=scrypt\$...\$...
```

- `ADMIN_SESSION_SECRET` signs the sign-in cookie. `ADMIN_ENCRYPTION_KEY` (32 bytes, base64) encrypts the authenticator secret.
- `ADMIN_PASSPHRASE_HASH` is `scrypt$<salt>$<hash>`. The script prints the `$` separators as `\$` because Next.js expands `$NAME` inside `.env` files; paste the line exactly as printed, both in `.env.local` and in Vercel (the server accepts either form).
- The passphrase itself is never stored anywhere. Keep it in your password manager. Quote it in the command so the shell passes it as one argument, and clear the command from your shell history afterwards if you like.
- Keep a private copy of `ADMIN_ENCRYPTION_KEY`: if it is lost or changed, the stored authenticator secret cannot be decrypted and you will need to re-enrol (see step 5). Without an argument the script prints only the two random secrets.

## 3. Vercel environment variables

In the Vercel project: **Settings → Environment Variables**. Add each of these for **Production** and **Preview**:

- `ADMIN_SESSION_SECRET`, `ADMIN_ENCRYPTION_KEY`, `ADMIN_PASSPHRASE_HASH` (the values from step 2)
- `SMTP_USER`, `SMTP_PASSWORD` and any optional SMTP values.
- `DATABASE_URL` is already there from the Neon Storage integration.

If the project still has `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL` or `NEXTAUTH_SECRET` from the old Google sign-in, delete them. (`NEXTAUTH_SECRET` is still read as a fallback when `ADMIN_SESSION_SECRET` is missing, but there is no reason to keep both.)

Never add `ADMIN_LOCAL_DB` or `ADMIN_DEV_BYPASS` to Vercel. Both are ignored there anyway, but they have no business in a deployed environment.

**Redeploy** after changing variables (Deployments → latest → Redeploy); running deployments do not pick up new values.

## 4. First sign-in and authenticator enrolment

1. Open `https://<your-domain>/admin`. At **Welcome back.** (Step 1 of 2 · Passphrase) enter your passphrase and choose **Continue**.
2. **Make it yours.** Choose **Set up authenticator**, scan the QR code with an authenticator app (Google Authenticator, 1Password, Authy, etc.), and enter the six-digit code. The QR code is valid for 10 minutes; after that, start again.
3. **Keep these safe.** Eight recovery codes are shown once. Download them or copy them into your password manager, then continue.
4. You are in the studio: **Content** (edit → Save draft → Preview draft → Publish), **Analytics**, **Inbox**.

On later visits you enter the passphrase, then the current authenticator code (**One more step.**).

## 5. Recovery and rotation

- **Lost phone:** at "One more step." enter one recovery code (format `xxxxxxxx-xxxxxxxx`) instead of the six-digit code. Each code works once.
- **Out of recovery codes, or `ADMIN_ENCRYPTION_KEY` lost:** reset enrolment in the Neon SQL editor, then sign in again and enrol a new authenticator:

  ```sql
  DELETE FROM admin_sessions;
  DELETE FROM admin_totp;
  ```

- **Rotate the passphrase:** run `node scripts/make-secrets.mjs "new passphrase"`, copy only the `ADMIN_PASSPHRASE_HASH` line into Vercel (Production and Preview) and `.env.local`, and redeploy. Your authenticator and recovery codes stay as they are. Leave `ADMIN_ENCRYPTION_KEY` unchanged, or the authenticator must be re-enrolled.
- **Sign everyone out:** replace `ADMIN_SESSION_SECRET` with a fresh value from the script and redeploy. Every existing sign-in cookie stops working.
- **Locked after five wrong passphrases or codes:** wait 15 minutes.
- **"Owner sign-in is not configured" / "Almost ready."**: one of the variables in steps 1–3 is missing in that environment, or the deployment predates it (redeploy).

## 6. Local development

To exercise the whole studio without Neon or a passphrase, create `.env.local` with:

```
ADMIN_LOCAL_DB=true
ADMIN_DEV_BYPASS=true
ADMIN_SESSION_SECRET=<from step 2>
ADMIN_ENCRYPTION_KEY=<from step 2>
```

Then `npm run dev` and open http://localhost:3111/admin.

- `ADMIN_LOCAL_DB=true` runs an in-process Postgres (PGlite) stored in `.local-db/` (git-ignored). Delete that folder to start fresh.
- `ADMIN_DEV_BYPASS=true` skips the passphrase with a synthetic owner session. The authenticator step is still required, so enrolment, verification and recovery codes are tested for real. To test the passphrase step locally, leave the bypass off and add `ADMIN_PASSPHRASE_HASH` from step 2.
- Both flags only work when `NODE_ENV` is not `production` and `VERCEL` is unset. A production build or any Vercel deployment ignores them. Never set them on Vercel.
- Without SMTP settings, contact messages are still saved to the inbox as "Awaiting email" and can be retried from the Inbox once SMTP is configured.
