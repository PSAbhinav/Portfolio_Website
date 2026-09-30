# Private studio setup

The studio at `/admin` lets you edit every section of the portfolio, preview a draft, publish it, read contact messages and see visitor analytics. It stays locked (the "Almost ready." screen) until the pieces below are in place.

Security model, for reference: only `abhinavpemmaraju@gmail.com` with a Google-verified e-mail can sign in; every visit then needs a code from an authenticator app (the secret is stored encrypted with AES-256-GCM); eight one-use recovery codes cover a lost phone; five wrong codes lock verification for 15 minutes; an unlocked session lasts four hours and is bound to that Google sign-in.

You will set these environment variables (names only; values never go in git):

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon, step 1 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud, step 2 |
| `NEXTAUTH_SECRET`, `ADMIN_ENCRYPTION_KEY` | Generated, step 3 |
| `NEXTAUTH_URL` | Your site origin, step 4 |
| `SMTP_USER`, `SMTP_PASSWORD` (+ optional `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`) | Contact e-mail, see README |

## 1. Neon Postgres

1. Sign in at https://console.neon.tech and create a project (any region close to your Vercel region, Postgres 16 or newer).
2. On the project dashboard choose **Connect**, keep the default branch and database, switch on **Connection pooling**, and copy the connection string. It looks like `postgresql://user:password@ep-...-pooler.<region>.aws.neon.tech/neondb?sslmode=require`.
3. Put it in `.env.local` as `DATABASE_URL=...`.
4. Create the tables:

   ```sh
   node scripts/setup-db.mjs
   ```

   It prints the table list (`admin_sessions`, `admin_totp`, `analytics_events`, `contact_inbox`, `content_history`, `portfolio_content`, `portfolio_media`). Re-running it is safe.

## 2. Google OAuth

1. Open https://console.cloud.google.com, create a project (e.g. "Portfolio studio").
2. **APIs & Services → OAuth consent screen**: user type **External**; app name, support e-mail and developer e-mail = your Gmail. Scopes: leave the defaults (`openid`, `email`, `profile`). Under **Test users** add `abhinavpemmaraju@gmail.com`. Leaving the app in "Testing" is fine: only test users can sign in, which is what you want.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**, application type **Web application**.
4. **Authorized redirect URIs** — add both:
   - `http://localhost:3111/api/auth/callback/google`
   - `https://<your-domain>/api/auth/callback/google`
5. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## 3. Secrets

Generate two different random values, one for `NEXTAUTH_SECRET` and one for `ADMIN_ENCRYPTION_KEY`:

```sh
openssl rand -base64 32
```

PowerShell alternative (run it twice):

```powershell
[Convert]::ToBase64String((1..32 | % { Get-Random -Max 256 }) -as [byte[]])
```

`ADMIN_ENCRYPTION_KEY` must decode to exactly 32 bytes. Keep a private copy: if it is lost or changed, the stored authenticator secret cannot be decrypted and you will need to re-enrol (see step 6).

## 4. Vercel environment variables

In the Vercel project: **Settings → Environment Variables**. Add each variable below for **Production** and **Preview**:

- `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `ADMIN_ENCRYPTION_KEY`
- `NEXTAUTH_URL` = `https://<your-domain>` for Production. For Preview, either leave it unset (the request origin is used) or set it to the preview domain you actually use.
- `SMTP_USER`, `SMTP_PASSWORD` and any optional SMTP values.

Never add `ADMIN_LOCAL_DB` or `ADMIN_DEV_BYPASS` to Vercel. Both are ignored there anyway, but they have no business in a deployed environment.

Redeploy after changing variables.

## 5. First sign-in and authenticator enrolment

1. Open `https://<your-domain>/admin` and choose **Continue with Google**. Pick the owner account.
2. **Make it yours.** Choose **Set up authenticator**, scan the QR code with Google Authenticator (or 1Password, Authy, etc.), and enter the six-digit code. The QR code is valid for 10 minutes; after that, start again.
3. **Keep these safe.** Eight recovery codes are shown once. Download them or copy them into your password manager, then continue.
4. You are in the studio: **Content** (edit → Save draft → Preview draft → Publish), **Analytics**, **Inbox**.

On later visits you sign in with Google, then enter the current authenticator code (**One more step.**).

## 6. Recovery

- **Lost phone:** at "One more step." enter one recovery code (format `xxxxxxxx-xxxxxxxx`) instead of the six-digit code. Each code works once.
- **Out of recovery codes, or `ADMIN_ENCRYPTION_KEY` lost:** reset enrolment in the Neon SQL editor, then sign in again and enrol a new authenticator:

  ```sql
  DELETE FROM admin_sessions;
  DELETE FROM admin_totp;
  ```

- **Locked after five wrong codes:** wait 15 minutes.
- **"Owner sign-in is not configured" / "Almost ready."**: one of the variables in steps 1–4 is missing in that environment.

## 7. Local development

To exercise the whole studio without Neon or Google, create `.env.local` with:

```
ADMIN_LOCAL_DB=true
ADMIN_DEV_BYPASS=true
NEXTAUTH_SECRET=<random, step 3>
ADMIN_ENCRYPTION_KEY=<random 32-byte base64, step 3>
NEXTAUTH_URL=http://localhost:3111
```

Then `npm run dev` and open http://localhost:3111/admin.

- `ADMIN_LOCAL_DB=true` runs an in-process Postgres (PGlite) stored in `.local-db/` (git-ignored). Delete that folder to start fresh.
- `ADMIN_DEV_BYPASS=true` skips Google sign-in with a synthetic owner session. The authenticator step is still required, so enrolment, verification and recovery codes are tested for real.
- Both flags only work when `NODE_ENV` is not `production` and `VERCEL` is unset. A production build or any Vercel deployment ignores them. Never set them on Vercel.
- Without SMTP settings, contact messages are still saved to the inbox as "Awaiting email" and can be retried from the Inbox once SMTP is configured.
