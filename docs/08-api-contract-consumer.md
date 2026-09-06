# API Contract (Consumer Side) — Rakuxon Web
**Repo:** `rakuxon-FE` · The BE owns the contract; this repo consumes it. See the BE's `07-api-contract.md` for the authoritative version.

## How the FE consumes the contract

> **Cross-repo dependency.** The FE renamed its scope to `@rakuxon/*` with the
> Rakuxon rebrand. The contract package is published by `rakuxon-edu-BE`, so
> `@rakuxon/contract` only exists once the BE renames in step. Until then the
> pinned dependency is still `@rakuxon-edu/contract` — treat this as a tracked
> migration, not a completed one, and update `CONTEXT.md` when the BE follows.

The BE publishes `@rakuxon/contract` (DTOs + enums) to a private registry. The FE:

1. Adds it as a dependency and **pins a version**.
2. Re-exports it through `packages/contract` so all apps import from one place.
3. `packages/api-client` uses those types for every request/response.

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
