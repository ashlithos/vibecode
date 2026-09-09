# Deploying to Vercel

The app runs as two pieces on Vercel: the React SPA as static files on the CDN,
and the Fastify API as a single Node Function under `/api`. Data lives in
Postgres (Neon's free tier is ample for one person).

## What you need to provide

Three things require your own accounts and cannot be created for you.

### 1. A Postgres database

Either add **Neon** from your Vercel project's *Storage* tab — which sets
`DATABASE_URL` for you — or create one free at [neon.tech](https://neon.tech)
and copy the connection string.

Use the **pooled** endpoint (its hostname contains `-pooler`). The direct
endpoint opens one backend per connection and will exhaust under serverless
fan-out.

### 2. Google OAuth credentials

At [console.cloud.google.com](https://console.cloud.google.com):

1. Create a project.
2. *APIs & Services* → *OAuth consent screen*. External, add yourself as a test
   user. It does not need verification while the allowlist is short.
3. *Credentials* → *Create credentials* → *OAuth client ID* → *Web application*.
4. Authorized redirect URIs — add both:
   ```
   http://localhost:5178/api/auth/google/callback
   https://<your-vercel-domain>/api/auth/google/callback
   ```

Keep the **Client ID** and **Client Secret**.

The redirect URI must match byte for byte, including scheme and trailing path.
A mismatch here is the single most common cause of `redirect_uri_mismatch`.

### 3. A session signing secret

```bash
openssl rand -base64 32
```

## Environment variables

Set these in Vercel under *Settings → Environment Variables*:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres string. Set automatically if you added Neon through Vercel. |
| `GOOGLE_CLIENT_ID` | From step 2. |
| `GOOGLE_CLIENT_SECRET` | From step 2. Secret — never commit. |
| `AUTH_SECRET` | From step 3. Rotating it signs everyone out, which is the intended emergency lever. |
| `ALLOWED_EMAILS` | Comma-separated allowlist. **Empty means anyone with a Google account can sign up.** |

`PUBLIC_BASE_URL` is optional — Vercel's own `VERCEL_PROJECT_PRODUCTION_URL` is
used when it isn't set. Set it only for a custom domain.

### On the allowlist

`ALLOWED_EMAILS` is checked on every request, not only at sign-in, so removing
someone revokes their existing sessions immediately rather than waiting for a
30-day cookie to lapse.

Leaving it empty is a deliberate choice, not a default: a public URL with open
signup lets strangers create rows against your database quota.

## First deploy

1. Push to `main` (or point Vercel at whichever branch you want).
2. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel reads
   `vercel.json`; leave the build settings alone.
3. Add the environment variables above, then deploy.
4. **Seed the exercise catalog once.** Migrations run automatically on every
   build; seeding does not, because it should not re-run on each deploy:
   ```bash
   DATABASE_URL="<your pooled url>" npm run db:seed
   ```
5. Open the deployment and sign in with Google.

Per-user defaults (settings, equipment availability) are created on first
sign-in, so there is nothing else to seed.

## Local development

```bash
cp packages/server/.env.example packages/server/.env   # then fill it in
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev            # api on :5178, web on :5179
```

Local dev talks to Postgres too — the same database engine as production, so
there is no behavioural gap between what you test and what ships. Point
`DATABASE_URL` at a Neon branch or a local Postgres, whichever you prefer.

## Tests

```bash
npm test                                    # engine only, no infrastructure
DATABASE_URL="postgresql://..." npm test    # adds cross-user isolation tests
```

The isolation tests need a real database because what they check is the SQL
`WHERE` clause; run them before any deploy that touches data access. Point them
at a scratch database — they create and delete their own users.

## Schema changes

```bash
npm run db:migrate --workspace @gym/server -- --name what_changed
```

Commit the generated folder under `prisma/migrations/`. `vercel-build` runs
`prisma migrate deploy`, so it applies on the next deploy.

## Troubleshooting

**`redirect_uri_mismatch`** — the URI in Google Cloud does not exactly match
`<PUBLIC_BASE_URL or Vercel URL>/api/auth/google/callback`. Preview deployments
get their own hostnames, so either add them or test sign-in on production.

**Signed in, then immediately signed out** — usually `AUTH_SECRET` differing
between build and runtime environments, or an email that is not in
`ALLOWED_EMAILS`. The server logs a warning naming the refused address.

**"Not signed in" on every API call while the sign-in page looks fine** — the
session cookie is not coming back. Check that the deployment is served over
HTTPS; the cookie is `secure` in production.

**Empty library after deploying** — migrations ran but the catalog was never
seeded. Run step 4.
