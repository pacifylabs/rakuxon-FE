# Frontend PRD — Rakuxon Web
**Repo:** `rakuxon-FE` · Turborepo monorepo of Next.js apps.

## 1. Purpose

The frontend delivers the five user-facing surfaces of the platform, consuming the BE API through a typed contract and uploading files directly to Cloudinary via backend-signed signatures. It carries the white-label theming and the realtime UX.

## 2. Surfaces (apps)

| App | Users | Core jobs |
|---|---|---|
| **base-site** | public | **Rakuxon Ltd brand site** (services, success stories, offices), **live typeahead search → university/course info pages (SEO)**, contact/partner/institution intake |
| **partner-app** | agency_admin, counselor | pipeline, students, document review, applications, messaging |
| **student-app** | student (tokenized) | profile, document upload, admission tracker, shortlist |
| **institution-portal** | institution_user | application inbox, offers, request-info |
| **admin** | platform_admin (**Rakuxon, the operator**) | vetting, **per-agency entitlements: feature flags, limits, data-access scope, suspend/enable**, catalogue review queue, plans/limits/splits config |

## 3. In scope this phase

All five surfaces at P0 depth · **real Rakuxon Ltd brand content on base-site** (`04b` §0) · **live catalogue search with university/course detail pages** · document upload center (signed Cloudinary) · AI check results surfaced in review · **admin entitlement controls** · subdomain white-label theming · realtime status + messaging · admin config screens for the money machinery (numbers editable).

## 4. Out of scope

Native mobile · custom-domain white-label · AI features beyond document-check display · value-added service UIs · Stripe checkout UI (deferred with the BE) · **admission-likelihood tiers** (the Edvoy-"Genie" equivalent — the course page reserves the slot, but AI course-matching is deferred platform-wide, so nothing is computed or shown).

## 5. Key flows (FE responsibility)

- **Student onboarding:** open tokenized link → guided profile → upload center → track status.
- **Counselor:** add/bulk-add students → generate link → review docs (with AI flags) → shortlist → apply → message institutions.
- **Institution:** triage inbox → request info → issue offer.
- **Admin:** vet tenants/institutions → manage catalogue → set plans/limits/splits.

## 6. Non-functional

- **Performance:** base-site SSG+ISR for SEO (university/course pages are the organic-search surface); apps code-split; **typeahead feels instant — 250ms debounce, in-flight requests cancelled so a slow early response never overwrites a fast later one**.
- **Security:** no Cloudinary secret on the client; documents viewed only via backend-signed URLs; tenant **and data scope** derived server-side — no client can request a wider scope than it holds.
- **Accessibility:** WCAG AA for forms and core flows (student-app especially). **The search combobox follows the full WAI-ARIA pattern** — `aria-activedescendant`, live-region result counts, complete keyboard support — and works without JavaScript as a plain form.
- **Consistency:** all apps consume `packages/ui` + design tokens; white-label is a token swap.
- **Contract safety:** all API types come from `packages/contract`; no hand-typed shapes.

## 7. Success criteria

Every flow above works against the deployed BE with tests written first (Vitest + RTL); the student-app runs the full upload→track journey; white-label renders two tenants distinctly; realtime status updates appear without refresh.
