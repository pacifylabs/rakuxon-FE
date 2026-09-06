# rakuxon-FE

Turborepo monorepo for the Rakuxon frontend surfaces. See `docs/` for the
PRD, implementation plan, design system and branch strategy.

## Current state

Stage 0 (trimmed) + the public landing page. The four remaining app shells
and the BE health badge are deliberately deferred — there is no backend to
call yet. See `docs/02-implementation-plan.md` for the full stage order.

```
apps/
└── base-site/     # Next.js, statically generated marketing page
packages/
├── ui/            # design system: theme tokens, ThemeProvider, components
├── config/        # NEXT_PUBLIC_* env validation
└── tsconfig/      # shared TypeScript configs
```

## Getting started

```bash
pnpm install
pnpm dev
```

The landing page runs at http://localhost:3000. It needs no environment
variables — it makes no API calls.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Runs every app's dev server |
| `pnpm test` | Vitest + React Testing Library, once |
| `pnpm test:watch` | The TDD loop |
| `pnpm typecheck` | `tsc --noEmit` across the workspace |
| `pnpm build` | Production build of every app |

CI runs typecheck, test and build on every push.

## Deploying

`vercel.json` at the repo root tells Vercel this is a Turborepo: it installs
from the lockfile, builds only `@rakuxon/base-site`, and serves
`apps/base-site/.next`.

Two things that will bite otherwise:

- **Vercel deploys `main`.** Work happens on `stage/*` branches, so `main` must
  actually be merged up before a deploy means anything. A build that reports
  *"No tasks were executed"* and *"No Output Directory named public"* is almost
  always `main` sitting on an older commit that has no `apps/` in it.
- **Root Directory.** The `vercel.json` above handles the monorepo from the
  repo root. Setting the project's Root Directory to `apps/base-site` in
  Vercel's settings is the alternative; do one or the other, not both.
- **`next` is declared at the repo root and never imported there.** Vercel's
  Next.js builder reads the framework version from the `package.json` at the
  Root Directory, and this repo's root is a Turborepo workspace. Without that
  declaration the build fails with *"No Next.js version detected"*. Keep its
  range in step with `apps/base-site/package.json`.

  If you instead set the Root Directory to `apps/base-site` in Vercel, that
  root `next` entry and `vercel.json` both become unnecessary — delete them,
  and enable *Include source files outside of the Root Directory* so
  `packages/ui` is still available to the build.
- **Node version.** `engines` is pinned to a single major. An open range like
  `>=20` makes Vercel adopt each new major on release without warning.

## Design tokens

Every colour, size, radius and shadow is a CSS custom property published by
`ThemeProvider` from `packages/ui/src/theme/tokens.base.ts`.

The Tailwind preset in `packages/ui/tailwind-preset.cjs` **replaces** rather
than extends Tailwind's scales, so `bg-blue-500`, `p-7` and `rounded-3xl` do
not compile. If a utility you want does not exist, add the token — do not
reach for an arbitrary value.

Tenants may override brand tokens only (`--color-primary`, `--color-accent`,
`--font-heading`, the brand name). State and neutral tokens are fixed so
"danger" means the same thing in every tenant; `tokens.types.ts` encodes this
and `mergeTokens` enforces it.

## Rules for this repo

- Test first — red, green, refactor. Commit on green.
- API types come from `packages/contract`; never hand-type a response shape.
- No Cloudinary key or secret client-side, ever. Documents are viewed through
  backend-signed URLs, never a constructed public URL.
- No raw colour or spacing values in app code.
