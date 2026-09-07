# API Contract (Consumer Side) — Rakuxon Web
**Repo:** `rakuxon-FE` · The BE owns the contract; this repo consumes it. See the BE's `07-api-contract.md` for the authoritative version.

## How the FE consumes the contract

> **Resolved.** The rebrand is complete: both repos are `@rakuxon/*` and the
> backend repo is `rakuxon-BE`. The stale `@rakuxon-edu/contract` pin is gone.
>
> **Mechanism decided (BE stage 1): OpenAPI generation, not a published package.**
> The BE serves its document at `/docs-json`; FE CI generates `packages/contract`
> from it. One artefact, produced by the running API, so it cannot drift. The
> published-package option below is retained only as the rejected alternative.

**How it actually works:**

1. The BE serves OpenAPI at `/docs-json` (and Swagger UI at `/docs`).
2. FE CI runs `openapi-typescript` into `packages/contract`.
3. `packages/api-client` uses those generated types for every request/response.
4. Apps import types from `packages/contract` — never from an app-local file.

**Public endpoints matter to generation too.** `GET /v1/catalogue/suggest`,
`/catalogue/search`, the two detail endpoints and `POST /v1/contact` are
unauthenticated but still in the contract; base-site consumes them through
`api-client` like anything else.

### Rejected alternative — a published package

The BE could publish `@rakuxon/contract` (DTOs + enums) to a private registry, with the FE pinning a version:

```
apps/* ─┐
        ├─ import types from packages/contract  ─→ @rakuxon/contract (pinned)
api-client ┘
```

**Never hand-type an API shape in an app.** If a type is missing, it's a contract gap → raise it against the BE, don't patch locally.

## Upgrading the contract

- Upgrading the pinned version is a deliberate FE PR.
- On a **major** bump (breaking BE change), read the BE PR's migration note, update call sites, get tests green, then merge.
- The FE can stay on an older contract version until ready — that's the point of pinning across separate repos.

## Alternative (if BE chose OpenAPI generation)

If the BE exposes OpenAPI instead of a package, FE CI generates the typed client into `packages/api-client` from the spec URL. Same rule: generated types are the only source; no hand-typing.

## Contract-safety in tests

- `typecheck` is part of CI — a contract mismatch fails the build.
- Component tests mock `api-client` responses using contract types, so mocks can't drift from real shapes.
