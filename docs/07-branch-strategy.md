# Branch Strategy — Rakuxon (FE)
**Applies to `rakuxon-FE`. Mirrors the BE strategy independently.**

## Branches

- **`main`** — always green, always deployable → Vercel production (all apps).
- **`stage/<n>-<name>`** — one per implementation-plan stage → Vercel preview.
- **`feature/<slug>`** — optional, single feature within a stage.
- **`fix/<slug>`** — bug fixes (failing test first).

## Flow

```
main
 └─ stage/3-core-slice     ← TDD the stage here
     └─ feature/upload-center
   → PR stage/3 → main when the stage gate (tests green) passes
   → merge → Vercel deploys production
 └─ stage/4-spine          ← branch from updated main, repeat
```

## Rules

1. Merge to `main` only when the stage's tests are green in CI.
2. TDD: commit on green, never on red.
3. Short-lived stage branches; rebase on `main` before the merge PR.
4. Each `stage/*` branch gets Vercel previews per app — smoke-test there.
5. Keep the contract version pinned; upgrading `@rakuxon/contract` is its own PR.

## PR checklist

- [ ] Tests written first; all green
- [ ] Types imported from `packages/contract` (no hand-typed API shapes)
- [ ] All network calls via `api-client`
- [ ] No Cloudinary secret client-side; document views use backend signed URLs
- [ ] Loading / empty / error states present
- [ ] White-label via tokens (no hard-coded brand values)
- [ ] a11y: labels, focus, contrast on new UI
