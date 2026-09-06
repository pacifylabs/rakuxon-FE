# Frontend PRD — Rakuxon Web
**Repo:** `rakuxon-FE` · Turborepo monorepo of Next.js apps.

## 1. Purpose

The frontend delivers the five user-facing surfaces of the platform, consuming the BE API through a typed contract and uploading files directly to Cloudinary via backend-signed signatures. It carries the white-label theming and the realtime UX.

## 2. Surfaces (apps)

| App | Users | Core jobs |
|---|---|---|
| **base-site** | public | marketing, course search (SEO), partner/institution intake |
| **partner-app** | agency_admin, counselor | pipeline, students, document review, applications, messaging |
| **student-app** | student (tokenized) | profile, document upload, admission tracker, shortlist |
| **institution-portal** | institution_user | application inbox, offers, request-info |
| **admin** | platform_admin | vetting, catalogue mgmt, plans/limits/splits config |

## 3. In scope this phase

All five surfaces at P0 depth · document upload center (signed Cloudinary) · AI check results surfaced in review · subdomain white-label theming · realtime status + messaging · admin config screens for the money machinery (numbers editable).

## 4. Out of scope

Native mobile · custom-domain white-label · AI features beyond document-check display · value-added service UIs · Stripe checkout UI (deferred with the BE).

## 5. Key flows (FE responsibility)

- **Student onboarding:** open tokenized link → guided profile → upload center → track status.
- **Counselor:** add/bulk-add students → generate link → review docs (with AI flags) → shortlist → apply → message institutions.
- **Institution:** triage inbox → request info → issue offer.
- **Admin:** vet tenants/institutions → manage catalogue → set plans/limits/splits.

## 6. Non-functional

- **Performance:** base-site SSR/SSG for SEO; apps code-split; catalogue search feels instant.
- **Security:** no Cloudinary secret on the client; documents viewed only via backend-signed URLs; tenant derived server-side.
- **Accessibility:** WCAG AA for forms and core flows (student-app especially).
- **Consistency:** all apps consume `packages/ui` + design tokens; white-label is a token swap.
- **Contract safety:** all API types come from `packages/contract`; no hand-typed shapes.

## 7. Success criteria

Every flow above works against the deployed BE with tests written first (Vitest + RTL); the student-app runs the full upload→track journey; white-label renders two tenants distinctly; realtime status updates appear without refresh.
