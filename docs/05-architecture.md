# Frontend Architecture & Folder Structure — Rakuxon Web
**Repo:** `rakuxon-FE` · Turborepo (pnpm workspaces).

## Folder structure

```
rakuxon-FE/
├── docs/
├── apps/
│   ├── base-site/           # Next.js SSR/SSG — marketing + intake + course search (SEO)
│   ├── partner-app/         # Next.js — agency workspace (authenticated)
│   ├── student-app/         # Next.js — tokenized, lightweight, deploy-alone
│   ├── institution-portal/  # Next.js — institution users
│   └── admin/               # Next.js — platform admin
├── packages/
│   ├── ui/                  # design system (see 04) + tokens + ThemeProvider
│   ├── api-client/          # typed client over the contract; all network calls here
│   ├── contract/            # consumes @rakuxon/contract (BE source of truth)
│   ├── auth/                # session, refresh, guards, tokenized-entry helper
│   ├── uploads/             # Cloudinary signed-upload helper (uploadDocument)
│   ├── config/              # env validation (NEXT_PUBLIC_* only)
│   └── tsconfig/
├── turbo.json
├── package.json
├── .github/workflows/ci.yml
├── .env.example
└── README.md
```

## App composition rule

Apps **compose** from `packages/*`. They hold routes, layouts, and screen assembly — not primitives, not raw fetches, not hand-typed API shapes.

## Data flow

```
component → hook → api-client (typed via contract) → BE API
uploads:   component → uploads.uploadDocument() → BE sign-upload → Cloudinary → BE confirm
realtime:  component → socket client → live status/message updates
theme:     middleware(subdomain) → ThemeProvider(tokens) → components
```

## `packages/uploads` (the security-critical helper)

`uploadDocument({ studentId, documentType, file })`:
1. validate type/size locally (fail before signing),
2. `POST /documents/sign-upload` → get signature,
3. upload bytes directly to Cloudinary,
4. `POST /documents/confirm`.
Never touches an API secret; only `cloud_name` + per-upload signature. Document viewing uses a backend signed-URL endpoint, never a constructed public URL.

## `packages/contract`

Re-exports the BE-published `@rakuxon/contract` (DTOs + enums). Every app + `api-client` imports types from here. A version bump is a deliberate FE PR (see `07-api-contract-consumer.md`).

## Env (public-safe only)

```
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
# NEVER a Cloudinary api key or secret on the FE
```

## Per-app deploy

Each app is a separate Vercel project (see `05-deploy-guide.md`). student-app deploys independently so its public/tokenized entry never shares the authenticated apps' assumptions.
