# Frontend Implementation Plan — Rakuxon Web
**Repo:** `rakuxon-FE` · TDD (Vitest + React Testing Library) · Follows BE stage gates.

> The FE advances in lockstep with the BE by stage. Each stage is a branch (`06-branch-strategy.md`), TDD throughout, and ends in a gate. Build against the BE contract; mock the API in component tests, hit the real BE in a thin e2e smoke.

---

## Stage 0 — Foundation `branch: stage/0-foundation`

**Build:** Turborepo, five app shells, shared packages, CI, one app calls BE `/health`.

**TDD steps**
1. Test: `packages/config` throws if `NEXT_PUBLIC_API_BASE_URL` missing → implement validation.
2. Test: a `<HealthBadge/>` renders "API: ok" when the client resolves health (API mocked) → implement `api-client` stub + component.

**Gate:** `pnpm dev` boots all apps; health badge green; CI passes.

> **Status: green.** `packages/config`, `packages/contract` (generated from the API's OpenAPI document), `packages/api-client` and `packages/ui`. The health badge lives in every authenticated app and reports three states, not two: healthy, reachable-but-database-down, and unreachable. `student-app` is not built — it is stage 3 work.

## Stage 1 — Auth & session `branch: stage/1-auth`

**Build:** `packages/auth` (session, refresh, guards), login/register/reset screens, SSO button, route protection.

**TDD steps**
1. Test: login form validates + submits; on success stores session; on 401 shows error (API mocked) → implement.
2. Test: a protected route redirects an unauthenticated user → implement guard.
3. Test: role-gated UI hides admin controls from a counselor → implement RBAC-aware rendering.
4. Test: SSO button initiates the provider redirect → implement.

**Gate:** auth flows green across partner-app + institution-portal + admin.

> **Status: green.** `packages/auth` holds the session, the rotation timer, `SignInForm`, `RequireAuth` and `GuardedPage`. All three apps sign in, guard their dashboards and gate on role; partner-app also registers an agency. **Not done:** the SSO button (the API endpoint exists) and password-reset screens.

## Stage 2 — Brand content, live search & info pages `branch: stage/2-brand-and-search`

*(The FE previously had no Stage 2 — isolation was BE-only. This plan revision gives it one: the marketing site becomes the real Rakuxon Ltd site, and the catalogue gets its public face. Depends on BE stage 2c for the search + detail endpoints.)*

**Build:** real brand content per `04b` §0, `/services`, `/success-stories`, the typeahead `SearchField`, and `/universities/[slug]` + `/courses/[slug]`.

**TDD steps**
1. Test: `brand.tagline` resolves to *"Where Minds Meet Maps."* and the wordmark renders it → change the token in `packages/ui/src/theme/tokens.base.ts`.
2. Test: the stat bar renders 2,500+ / 200+ / 11+ / 95% and each counts from 0 on scroll, with the final value present in an `sr-only` span → replace the placeholder figures.
3. Test: the success-stories slider renders the six real names + destinations, pauses on hover, focus and `prefers-reduced-motion` → wire real testimonials.
4. Test: the footer renders both office addresses, both phone numbers as `tel:` links, and the six social links → rebuild the footer grid.
5. Test: `/services` renders six service sections with unique headings → implement.
6. Test: typing 1 character calls nothing; typing 2+ calls `suggest` **once** after 250ms, not once per keystroke → implement debounce.
7. Test: a superseded in-flight request is aborted, so a slow earlier response never replaces a newer one → implement `AbortController`.
8. Test (a11y): the input is a `combobox` with `aria-expanded`/`aria-controls`; ↓ moves `aria-activedescendant` without moving focus; Enter navigates; Escape closes; the result count is announced in a live region → implement the WAI-ARIA pattern.
9. Test: with JavaScript disabled the field is a real form posting to `/universities?q=` → implement progressive enhancement.
10. Test: `/courses/[slug]` renders overview, entry requirements, fees, intakes and location from mocked contract types; an unknown slug renders `not-found` → implement.
11. Test: the course page emits `Course` JSON-LD and a canonical URL → implement SEO metadata.
12. Test: the contact form posts to `POST /v1/contact` and the honeypot field is present, hidden and untabbable → implement.

**Gate:** search works keyboard-only and with a screen reader; both detail page types render from the real BE; every placeholder marker is gone from base-site; a11y pass green.

---

## Stage 3 — Core student-document slice `branch: stage/3-core-slice`

*(FE has no Stage 2 — isolation is BE-only.)*

**Build:** student-app (link entry, profile, upload center), partner-app (add student, student detail, doc review). `packages/uploads` signed-Cloudinary helper.

**TDD steps**
1. Test: opening a valid onboarding link renders the student profile scope (API mocked) → implement entry.
2. Test: profile form validates + saves → implement.
3. Test: `uploadDocument()` requests a signature, uploads to Cloudinary, then confirms (both mocked); rejects oversized/wrong-type before signing → implement helper + upload center.
4. Test: document shows "under review"; counselor review screen renders accept/reject → implement.
5. Test: viewing a document calls the backend signed-URL endpoint (never builds a public URL) → implement.

**Gate:** full slice runs in-browser across student-app + partner-app (API/Cloudinary mocked in tests, real in manual smoke).

## Stage 4 — Workflow spine `branch: stage/4-spine`

**Build:** pipeline board, student list + filters, bulk-import UI, catalogue search + shortlist, application create + status + messaging UI.

**TDD steps**
1. Test: pipeline board moves a student between stages (optimistic + reconciled) → implement.
2. Test: bulk-import surfaces row errors → implement.
3. Test: the authenticated catalogue browse renders filtered results, reusing stage 2's search components rather than a second implementation → implement.
4. Test: create-application flow attaches required docs + shows status → implement.

**Gate:** counselor drives lead → submitted application; green.

## Stage 5 — Institution portal `branch: stage/5-institution`

**Build:** institution inbox, request-info, issue-offer screens; admin vetting, **entitlement controls** + catalogue review screens.

**TDD steps**
1. Test: inbox lists only routed applications (API mocked) → implement.
2. Test: issue-offer updates status in the UI → implement.
3. Test: admin vetting approve/suspend actions render + call API → implement.
4. Test: the per-agency entitlement editor toggles a feature flag, edits a limit, and switches data access between `own` and `shared`; an absent flag renders as **off** → implement.
5. Test: changing an entitlement shows a confirmation naming the effect — switching an agency to `shared` says in plain words that its students become visible to other agencies → implement.
6. Test: the entitlement audit trail renders who changed what and when → implement.

**Gate:** 3-sided loop visible end to end.

## Stage 6 — AI results in review `branch: stage/6-ai-ui`

**Build:** surface `ai_check_json` flags in the document review UI.

**TDD steps**
1. Test: a document with AI flags renders the flag list + severity → implement.
2. Test: a clean document renders "no issues" → implement.
3. Test: pending check shows a processing state → implement.

**Gate:** AI flags visible in review; green.

## Stage 7 — Admin config (money machinery) `branch: stage/7-admin-config`

**Build:** plans/limits screen, commission-split config, usage/ledger read views. Numbers editable.

**TDD steps**
1. Test: editing a plan price/limit persists (API mocked) → implement.
2. Test: commission-split field validates + saves → implement.
3. Test: usage + ledger read views render aggregates → implement.

**Gate:** admin can edit all configurable numbers; green.

## Stage 8 — White-label + realtime `branch: stage/8-whitelabel-realtime`

**Build:** subdomain→tenant theming via middleware + `ThemeProvider`; websocket client for live status/messages.

**TDD steps**
1. Test: `ThemeProvider` applies a tenant's tokens (colors/logo) → implement.
2. Test: a websocket status event updates the tracker without refresh (socket mocked) → implement.
3. Test: two subdomains render distinct branding → implement middleware resolution.

**Gate:** distinct branding per subdomain; live updates; green.

## Stage 9 — Polish & a11y `branch: stage/9-polish`

**Build:** accessibility pass, empty/error/loading states, responsive refinement.

**TDD steps**
1. Test: core forms pass a11y assertions (roles/labels) → fix.
2. Test: error + empty states render for key lists → implement.

**Gate:** a11y AA on core flows; states covered; green.

---

## Definition of Done (every FE feature)

Tests written first and green · types imported from `packages/contract` (never hand-typed) · all network calls via `api-client` · no Cloudinary secret client-side · white-label via tokens · loading/error/empty states present.
