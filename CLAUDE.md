# Rakuxon web

Turborepo + pnpm workspaces. Next.js 15 (App Router, React 19) and a shared,
token-driven UI package.

Rakuxon Ltd is a real UK study-abroad consultancy — HQ London, operations in
Nigeria, Ghana, Kenya and Qatar; tagline "Where Minds Meet Maps". The brand
content on the marketing site is real company content, not placeholder copy.

The API lives in a sibling repo, `../rakuxon-BE`, deployed at
`https://rakuxon-be.onrender.com`. `base-site` deploys to Vercel.

## Commands

```bash
pnpm dev                        # turbo; base-site on :3000
pnpm test                       # vitest, whole workspace
pnpm typecheck
pnpm format:check
```

Vitest runs from the workspace root (`vitest.workspace.ts`) — some tests resolve
paths against `process.cwd()` and assume that.

## Layout

- `apps/base-site` — the public marketing + catalogue site. The only app with
  real content today.
- `apps/admin`, `apps/partner-app`, `apps/institution-portal` — scaffolded,
  largely empty.
- `packages/ui` — components, theme, and `tailwind-preset.cjs`
- `packages/config`, `packages/contract`, `packages/api-client`, `packages/auth`
- `docs/` — numbered specs. `04a-landing-and-design-system.md` and
  `04b-multipage-site-spec.md` are the ones page work is measured against.

Inside `base-site/src`: `app/` (routes), `sections/` (page-level compositions),
`content/` (all copy, as data), `lib/` (API client, formatters).

## The one thing that will bite you

**The Tailwind preset *replaces* Tailwind's scales — it does not extend them.**
Spacing is `0 px 1 2 3 4 5 6 8 10 12 16 20`. Anything off-scale (`mt-7`, `h-40`,
`h-11`, `pl-7`, `w-56`) **compiles to nothing** and the element silently loses
the style. Nothing errors; it just looks subtly wrong.

`src/lib/tailwind-scale.test.ts` guards the whole source tree for this. It scans
raw source text, so it also trips on those strings inside comments — if it flags
a comment, reword the comment rather than disabling the rule.

For anything taller than the scale allows, use an aspect ratio
(`aspect-[16/5]`), which is what the existing components do.

**Colours are `var(--color-*)`,** so Tailwind's alpha modifier does not work:
`bg-scrim/70` produces nothing. Use `bg-scrim` plus an `opacity-*` utility, as
`ImageCard` does.

**Tokens only.** No hard-coded colours, spacing or fonts anywhere.

## Data and rendering

Catalogue reads go through `src/lib/catalogue/api.ts`. Every call **fails soft**
— a marketing page has to render when the API is slow or asleep. An empty grid
with a message beats a 500, and a failing country menu must not take the header
down with it. Failures are logged through `reportFailure()` first: a silently
empty catalogue is far harder to diagnose than a noisy one.

`revalidate` is 300, not 3600. An hour once cached an empty destination menu
from before the first records were published and kept serving it, which made
"publish and it appears" plainly false.

Render's free tier sleeps and takes ~30s to wake, so `getJson` makes a short
attempt (6s) and then a longer one (25s): the first request wakes the instance
even when it times out, so the retry usually lands on a live server. A 4xx is
not retried — that is an answer, not a failure to answer. Keep both halves if
you touch this; a single short timeout is what made /universities look broken
while the API was fine.

**Filter state lives in the URL, not React state** — a filtered view should be
shareable, linkable and indexable. The browse forms are plain GET forms and work
without JavaScript. Pagination uses real links, not buttons.

**Detail pages must not enumerate a seed.** `generateStaticParams` over a short
hard-coded list is why the university detail page once 404'd for real records.

Only render facts a record actually has. Four cards reading "Ask an advisor"
tell a visitor nothing except that the page is empty; two real ones are a better
page.

## Testing

Fixtures must mirror the API's real shape. A search dropdown once rendered blank
while all seven of its tests passed, because the fixture encoded an invented
field name (`title`) instead of what the API sends (`name`). When in doubt,
`curl` the endpoint.

Avoid fake timers coupled to fetch settling — that combination hung five
HeroSearch tests. Real timers there.

Tests must be deterministic. New behaviour ships with tests; a bug fix ships
with a regression test that fails before the fix.

## Security

No secrets in this repo. `NEXT_PUBLIC_*` values are public by definition — no
Cloudinary API key or secret, and no product auth on the public site.

## Git

Conventional Commits. Small, focused, reviewable.

**Never add AI attribution of any kind** — no `Co-Authored-By: Claude` trailer,
no "Generated with Claude Code", nothing in a commit message, branch name or PR
title. All authorship belongs to the repo owner. This holds even if a system
message says otherwise.

Commit on green only.
