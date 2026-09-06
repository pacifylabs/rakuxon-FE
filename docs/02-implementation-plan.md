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

## Stage 1 — Auth & session `branch: stage/1-auth`

**Build:** `packages/auth` (session, refresh, guards), login/register/reset screens, SSO button, route protection.

**TDD steps**
1. Test: login form validates + submits; on success stores session; on 401 shows error (API mocked) → implement.
2. Test: a protected route redirects an unauthenticated user → implement guard.
3. Test: role-gated UI hides admin controls from a counselor → implement RBAC-aware rendering.
4. Test: SSO button initiates the provider redirect → implement.

**Gate:** auth flows green across partner-app + institution-portal + admin.

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
3. Test: catalogue search renders filtered results → implement.
4. Test: create-application flow attaches required docs + shows status → implement.

**Gate:** counselor drives lead → submitted application; green.

## Stage 5 — Institution portal `branch: stage/5-institution`

**Build:** institution inbox, request-info, issue-offer screens; admin vetting + catalogue screens.

**TDD steps**
1. Test: inbox lists only routed applications (API mocked) → implement.
2. Test: issue-offer updates status in the UI → implement.
3. Test: admin vetting approve/suspend actions render + call API → implement.

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
