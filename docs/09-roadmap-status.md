# Roadmap status — what changed, what stands, what needs a decision

*Written 7 September 2026, after the brand, palette, catalogue and search work.*

This is the honest reconciliation between `02-implementation-plan.md` and what
is actually on disk. Read it before planning the next stage.

---

## 1. Where the plan has moved

| | Original plan | Now | Why |
|---|---|---|---|
| **Palette** | "Modern Campus" forest green | Cobalt sampled from the logo | The design system disagreed with the logo in the header |
| **Catalogue source** | Proxy a competitor's internal routes | Own bank + open sources | Build-id URLs break each of their deploys; their listings are a licensed database; and while the data was theirs nobody here could decide what a visitor sees |
| **Universities listing** | Whole open registry | Our own catalogue | Most registry cards had no page and nothing to apply to |
| **FE stage 2** | Did not exist (isolation was BE-only) | Brand, search, info pages | The marketing site needed the catalogue's public face before the workflow did |
| **BE catalogue** | Stage 4 | Stage 2c | Same reason |
| **Search UX** | Field → results page | Typeahead → the record itself | Sending a pick to `?q=<title>` made people search twice |

**Unchanged and still load-bearing:** the tenant-isolation gate is sacred;
TDD throughout; interfaces before providers; config over hard-coding; one
source of truth for the API contract.

---

## 2. Stage board

| Stage | Scope | State |
|---|---|---|
| BE 0 | Foundation, health, CI | ✅ green |
| BE 1 | Auth, RBAC, tenancy, SSO, onboarding links | ✅ green |
| BE 2 | RLS, two database roles, isolation gate | ✅ green (27 gate tests, proven by mutation) |
| **BE 2b** | Entitlements, operator context, access-scope switch | ⛔ **not started — next** |
| **BE 2c** | Catalogue entities, search endpoints, ingestion | ⛔ not started |
| **BE 2d** | `POST /v1/contact` | ⛔ not started |
| FE 0 | Turborepo, packages, health badge | ✅ green |
| FE 1 | Auth screens, session, guards | ✅ green |
| **FE 2** | Brand, live search, info pages | 🟡 **mostly done — see §3** |
| FE/BE 3+ | Student-document slice onward | ⛔ untouched |

**441 FE tests · 77 BE unit · 55 BE e2e · 27 BE isolation.**

---

## 3. FE stage 2, precisely

**Done.** Real Rakuxon Ltd content (§0 of `04b`) · `/services` · logo wired
through `brand.logo` with a dark-scheme knockout · cobalt palette in both
schemes · the catalogue schema · the bank · typeahead search → detail pages ·
`/courses/[slug]` and `/universities/[slug]` with JSON-LD and canonicals ·
apply-with-selection carried into the contact form · client-side navigation ·
the map backdrop across every page · footer rebuilt.

**Not done.** `/success-stories` as its own page (the six testimonials render
on the home page only) · listing filters — study level and subject chips ·
the soft sign-up prompt injected mid-list · course pages beyond the four in
the bank.

---

## 4. Data: fetched from where, saved where

Three different answers today, and only one of them is durable.

| Data | Fetched | Saved | Editable by an admin |
|---|---|---|---|
| **Institutions** (listing, counts) | ROR API, live per request | **Nowhere** — Next data cache only | No |
| **Courses** | Local `bank.ts` | In the repo, as TypeScript | Only by a developer |
| **Brand, services, testimonials** | Local content modules | In the repo | Only by a developer |

**The gap this leaves.** A live fetch vanishes on redeploy, differs between
instances, and cannot be curated. `status: draft | published | suspended`
exists in the schema and means nothing while the rows are somebody else's.

**What was added.** `apps/base-site/scripts/ingest-catalogue.ts`:

```bash
pnpm --filter @rakuxon/base-site ingest:catalogue              # all countries
pnpm --filter @rakuxon/base-site ingest:catalogue --country GB
pnpm --filter @rakuxon/base-site ingest:catalogue --dry-run
```

fetch → normalise → **match on source id** → merge field-by-field → write
`src/lib/catalogue/data/institutions.<cc>.json`. Every row carries
`sourceId`, `sourceRecordId`, `sourceUrl`, `licence`, `retrievedAt`. Re-running
updates in place: verified, 42 rows on the first run and 42 on the second.

**Source: ROR only.** CC0, versioned, no key, redistribution explicitly
permitted — so a stored snapshot is ours to serve, edit and unpublish. Adding a
source means writing an adapter *and* recording its licence in
`rakuxon-BE/docs/10-catalogue-data.md` §5 first. Worth stating plainly, since
this is described as a scraping pipeline: **writing data to disk does not
change what a source's terms permit.** Storage is usually the specific thing
those terms restrict, so the licence check has to happen before the adapter,
not after.

**Still missing: course-level data.** No open dataset publishes fees, intakes
or entry requirements. That is why `bank.ts` is a hand-written sample set,
marked as such, and why it is attached to example institutions rather than real
ones — an invented deadline under a real university's name is something a
student would plan around. Real course data comes from partner feeds
(`10-catalogue-data.md` §5), and Rakuxon Ltd's existing 200+ partners are the
natural first tranche.

**The JSON files are a staging post, not the destination.** The destination is
Postgres behind BE stage 2c, where an admin can actually toggle a row.

---

## 5. What needs a decision

1. **Course data source.** Partner feeds are the only route to real fees and
   deadlines. Who at Rakuxon can supply the first one, and in what format?
   Everything downstream — filters, comparison, matching — is thin without it.
2. **Where the bank lives after 2c.** The JSON snapshot is fine for a
   prerendered marketing site and wrong as a system of record. Confirm the
   catalogue moves to Postgres at 2c rather than growing in the repo.
3. **The trust bar.** Six invented institutions under "Trusted by students and
   partners worldwide". Now that the real 200+ partner figure is published on
   the same page, this should be real partner logos or a different claim.
   Flagged `data-sample`, so it is greppable.
4. **`STUDENT_DATA_SCOPE` default.** The switch is specified but unbuilt.
   Confirm the shipped default is `platform`, given the §1 risk callout in
   `rakuxon-BE/docs/09-tenant-isolation.md`.
5. **Admission-likelihood tiers.** The course page reserves the slot. AI
   course-matching is deferred platform-wide, so it stays empty until that
   changes.

---

## 6. Recommended next step

**BE stage 2b, then 2c.** 2b makes the admin toggle real — entitlements, the
operator context, the access-scope switch, the gate running in both scope
modes. 2c gives the FE a real catalogue to read, at which point the ingestion
script points at Postgres instead of JSON and the bank stops being a fixture.

Doing FE polish first would build more screens on a fixture that has to be
replaced anyway.
