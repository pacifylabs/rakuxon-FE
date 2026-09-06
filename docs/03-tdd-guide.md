# Frontend TDD Guide — Rakuxon Web
**Stack:** Vitest + React Testing Library (+ Playwright optional for thin e2e smokes).

## Why TDD here

The FE has lots of stateful flows (uploads, pipeline moves, realtime) and a hard security rule (never expose Cloudinary secrets, never build public document URLs). Writing tests first turns those rules into executable specs and stops regressions as the surface area grows.

## The loop

**Red → Green → Refactor**, per acceptance criterion. Commit on green.

## Test layers

| Layer | Tool | Tests what |
|---|---|---|
| **Unit** | Vitest | helpers, hooks, the `uploadDocument` helper, formatters |
| **Component** | Vitest + RTL | components/screens with the API + sockets **mocked** |
| **Contract** | Vitest | that components use `packages/contract` types (typecheck) + `api-client` calls shape correctly |
| **E2E smoke** (optional/thin) | Playwright | a couple of happy-path journeys against a real BE preview |

Component tests mock the network (MSW or a mocked `api-client`); they never hit the real API. Keep e2e thin — a few journeys, not everything.

## What to mock

- **Mock:** `api-client` responses (via MSW), the Cloudinary upload POST, the websocket.
- **Assert (don't skip):** that `uploadDocument()` requests a signature *before* uploading, validates type/size *before* signing, and that document views call the backend signed-URL endpoint — never construct a public Cloudinary URL.

## Key tests that protect the security rules

- `uploadDocument` never receives or uses an API secret (only cloud_name + signature).
- A document view component calls `GET /documents/:id/url` and uses the returned URL — a test asserts no `res.cloudinary.com/...` public URL is ever built client-side.
- Tenant is never sent as a client field — the client relies on the session/subdomain.

## Conventions

- Test behavior a user observes (RTL: query by role/label), not implementation details.
- One behavior per test; independent tests.
- Every bug fix starts with a failing test.
- Types come from `packages/contract`; a failing typecheck is a failing test.

## Scripts

```
test          # vitest run
test:watch    # TDD loop
test:e2e      # playwright (optional)
typecheck     # tsc — contract safety
```

CI runs `typecheck` + `test` (+ `test:e2e` if enabled) on every push.
