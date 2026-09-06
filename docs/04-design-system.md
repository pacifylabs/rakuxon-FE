# Design System — Rakuxon Web
**Repo:** `rakuxon-FE` · Lives in `packages/ui`. Built for **white-label**: every visual value is a token a tenant can override.

> This is the single visual source of truth for all five apps. The core principle: **nothing hard-codes a color, font, or spacing value** — everything reads from tokens, so a tenant's branding is a token swap, not a code change.

---

## 1. Principles

1. **Token-driven & themeable.** Every color/space/radius/font is a CSS variable resolved from a tenant's token set.
2. **One component library, five apps.** `packages/ui` is consumed everywhere; apps compose, they don't restyle.
3. **Accessible by default.** AA contrast, focus-visible, semantic roles, keyboard paths — especially in the student-app.
4. **Trust-forward.** This app handles academic documents and admissions; the visual language should feel calm, credible, and uncluttered, not flashy.
5. **Content-first density.** Counselors and admins scan lists and pipelines all day — favor legible, scannable layouts over decoration.

---

## 2. Token architecture

Two layers: **base tokens** (the default Rakuxon theme) and **tenant overrides** (white-label). A tenant's overrides are fetched from the API by subdomain and merged over the base at runtime by `ThemeProvider`.

```
packages/ui/src/theme/
├── tokens.base.ts        # default values (the fallback theme)
├── tokens.types.ts       # the token contract (what a tenant MAY override)
├── ThemeProvider.tsx     # merges base + tenant tokens → CSS variables on :root
└── useTheme.ts
```

### Token categories

```
color:
  --color-bg, --color-surface, --color-surface-muted
  --color-text, --color-text-muted, --color-text-inverse
  --color-primary, --color-primary-hover, --color-on-primary
  --color-accent
  --color-success, --color-warning, --color-danger, --color-info
  --color-border, --color-focus-ring
typography:
  --font-sans, --font-heading
  --text-xs … --text-3xl   (size + line-height pairs)
  --weight-regular / -medium / -semibold / -bold
space:      --space-1 … --space-12   (4px base scale)
radius:     --radius-sm/-md/-lg/-full
shadow:     --shadow-sm/-md/-lg
z-index:    --z-dropdown/-modal/-toast
motion:     --ease-standard, --duration-fast/-base
```

**White-label rule:** a tenant may override **brand tokens** (`--color-primary`, `--color-accent`, `--font-heading`, logo) but **not** semantic/state tokens (success/warning/danger stay consistent for safety). `tokens.types.ts` encodes which are overridable.

---

## 3. Foundations (base theme defaults)

- **Color:** a calm, professional base — a trustworthy primary (deep forest green), sage-grey neutral surfaces, a sky-blue accent, clear state colors. Exact hex values live in `tokens.base.ts` and are specified in `04a` § 3.1; they are defaults, not law, since tenants reskin.
- **Typography:** one clean sans for body + UI, one for headings (can be the same family with weight contrast). System-font fallback stack for performance.
- **Spacing:** 4px base scale (`--space-1` = 4px). Consistent rhythm across lists and forms.
- **Radius/shadow:** soft, modest — credibility over flamboyance.

---

## 4. Core components (in `packages/ui`)

Build these first; every screen composes from them.

**Primitives:** Button (primary/secondary/ghost/danger), Input, Textarea, Select, Checkbox, Radio, Switch, DatePicker, FileDropzone, Badge, Avatar, Tooltip, Spinner, Skeleton.

**Composite:** Card, Modal/Dialog, Drawer, Tabs, Table (sortable/filterable), Pagination, Toast, Alert/Banner, EmptyState, FormField (label+input+error), Stepper, StatusPill.

**Domain components:** PipelineBoard (stage columns), StudentCard, DocumentReviewItem (with AI-flag list), ApplicationTimeline, ShortlistItem, UploadCenter, AdmissionTracker, MessageThread.

Each component: token-styled, a11y-complete, and shipped with a component test (TDD).

---

## 5. Patterns

- **Forms:** label + field + inline error; validate on blur + submit; disable submit while pending; never lose entered data on error. Student profile + upload are the highest-care forms.
- **Lists/tables:** always have loading (skeleton), empty, and error states. No bare spinners on primary content.
- **Status:** use StatusPill with consistent color mapping (state tokens) across pipeline, applications, documents.
- **Uploads:** UploadCenter shows per-file progress, validation errors before upload, and post-upload "under review" state; view actions call backend signed URLs.
- **AI flags:** DocumentReviewItem renders flags with severity (info/warning/danger tokens) and a plain-language reason; never present AI output as a verdict — it's decision support.
- **Realtime:** status/message updates arrive via socket and update in place with a subtle highlight; never a jarring reflow.

---

## 6. White-label theming flow

```
request on agency.rakuxon.com
 → Next middleware reads subdomain → resolves tenant
 → fetch tenant branding tokens from API (cached)
 → ThemeProvider merges base + tenant tokens → sets CSS variables on :root
 → all packages/ui components render in the tenant's brand automatically
```

Fallback: unknown/invalid subdomain → base Rakuxon theme.

---

## 7. Accessibility checklist (enforced in tests)

- AA contrast on text + interactive elements.
- Every input has a programmatic label; errors linked via `aria-describedby`.
- Visible focus ring (`--color-focus-ring`); full keyboard navigation.
- Modals trap focus + restore on close; Escape closes.
- Live regions announce realtime status changes for screen readers.

---

## 8. Responsive

- Student-app: mobile-first (students often on phones).
- Partner-app/admin: desktop-first, but usable at tablet width.
- Base-site: fully responsive, SEO-critical.

---

## 9. What NOT to do

- No hard-coded colors/spacing in app code — tokens only.
- No per-app component restyling — extend `packages/ui` instead.
- No overriding state colors per tenant (safety consistency).
- No public Cloudinary document URLs in any component (security).
