# VPS deployment

Production deployment now uses the shared Rakuxon Docker Compose stack. See `rakuxon-BE/ops/README.md` for the operational runbook. This repository supplies one standalone container per existing app and a CI-gated deployment workflow.

Browser API base: `/api`. Server-side catalogue base: `API_INTERNAL_URL=http://api:3001`. Public endpoints remain `/api/v1/...`.

The configuration below is the previous Vercel option, retained for reference.

# Frontend Deploy Guide — Vercel
**Repo:** `rakuxon-FE` · Turborepo monorepo → multiple Vercel projects.

## Model: one Vercel project per app

Each app in `apps/*` is its own Vercel project, all pointing at the same repo with a different **Root Directory**. This lets each surface deploy and scale independently.

| App | Suggested domain |
|---|---|
| base-site | `rakuxon.com` / `www` |
| partner-app | `app.rakuxon.com` + wildcard `*.rakuxon.com` (white-label subdomains) |
| student-app | `apply.rakuxon.com` |
| institution-portal | `schools.rakuxon.com` |
| admin | `admin.rakuxon.com` |

## Per-project setup (each app)

1. New Vercel project → import `rakuxon-FE`.
2. **Root Directory** = `apps/<app>`.
3. Framework preset: Next.js. Turbo handles the build; set the build command to the app's build (Vercel detects Turborepo).
4. **Environment variables:**
   ```
   NEXT_PUBLIC_API_BASE_URL=       # the deployed BE URL (Railway/Render)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   ```
   No Cloudinary key/secret — ever.
5. Set **Ignored Build Step** so an app only rebuilds when its files or shared `packages/*` change (Turbo's `--filter` / affected detection).

## White-label wildcard (partner-app)

- Add `*.rakuxon.com` as a wildcard domain on the partner-app project.
- Next middleware reads the subdomain → resolves the tenant → applies branding tokens.
- Verify two subdomains render distinct branding after deploy.

## Branch → environment

- **`main`** → production for each project.
- **`stage/*`** and PR branches → Vercel **Preview Deployments** automatically (unique URL per branch). Smoke-test a stage on its preview before merging.
- Merge to `main` only when the stage gate (tests green) passes in CI.

## CORS coordination

The BE's `CORS_ALLOWED_ORIGINS` must include each deployed FE domain (and preview domains if you smoke-test cross-origin). Keep this in sync when you add a domain.

## Post-deploy checks

- Each app loads; health badge (or first authed call) succeeds against the deployed BE.
- Upload flow works end-to-end against real Cloudinary (sign → upload → confirm → view via signed URL).
- Wildcard subdomain resolves + themes correctly.
- Realtime status updates arrive over the deployed websocket.

## Notes

- Keep `student-app` lean — it's the most latency-sensitive (students on phones, possibly poor networks).
- base-site uses SSG/ISR where possible for SEO + speed.
