/**
 * The token contract.
 *
 * Two layers (docs/04-design-system.md § 2): base tokens ship as the default
 * Rakuxon theme; a white-label tenant may override *only* the brand tokens
 * listed in `OVERRIDABLE_TOKENS`. State and neutral tokens are fixed on
 * purpose — a tenant must not be able to make "danger" look reassuring.
 */

export type BrandTokens = {
  /** Product name. Rendered by <Wordmark/>; swap here and nothing else changes. */
  name: string;
  /**
   * Trailing slice of `name` painted in the accent colour. Empty, or not a
   * suffix of `name`, renders the wordmark undivided — which is the case for
   * a one-word name.
   */
  nameAccentSuffix: string;
  /** Strapline in the logo lockup and the footer. */
  tagline: string;
  /**
   * The brand image, when the tenant has one.
   *
   * Two files, because a wordmark drawn in a dark brand colour disappears on a
   * dark ground — `logoDark` is the knockout used when the dark scheme is
   * active. Leave both unset and <Wordmark/> falls back to the drawn LogoMark,
   * which is token-coloured and therefore works in either scheme. That is also
   * what a white-label tenant gets until it uploads its own (stage 8).
   */
  logo?: string;
  logoDark?: string;
  /**
   * Intrinsic pixel size of `logo`, so next/image can reserve the box.
   *
   * Strings, not numbers: every token serialises into a CSS custom property,
   * and the serialiser's whole contract is that a token value is a string.
   */
  logoWidth?: string;
  logoHeight?: string;
};

export type ColorTokens = {
  primary: string;
  primaryHover: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  /**
   * Scrim over a photograph, and the text that sits on it. These are the one
   * colour pair that does NOT invert between schemes: a photo is a photo in
   * both, so the scrim must stay dark and its caption light either way.
   */
  scrim: string;
  onScrim: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  focusRing: string;
};

export type FontTokens = {
  /**
   * Institutional lockups only.
   *
   * University identities almost never use the interface face, so the trust
   * bar needs a serif to read as a row of institutions rather than a toolbar.
   */
  serif: string;
  sans: string;
  heading: string;
};

export type TextScaleTokens = {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  hero: string;
};

export type WeightTokens = {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
};

export type SpaceTokens = {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
};

export type RadiusTokens = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
};

export type ShadowTokens = {
  sm: string;
  md: string;
  lg: string;
};

/**
 * Decorative tints for categorical UI — the coloured icon squares in the
 * capability grid and the stat bar (docs/04b § 3.3, § 3.4).
 *
 * Deliberately separate from the state palette: painting a "Universities" chip
 * with --color-success would imply something succeeded, and would erode the
 * consistent status mapping the product relies on (docs/04-design-system § 5).
 *
 * tone1–tone4 are named for the slot, not the hue, so re-theming revalues them
 * without renaming an API. `urgent` is the one semantic member: it is reserved
 * for deadlines and time pressure and must not be used for decoration.
 *
 * Every foreground passes AA on --color-surface, --color-surface-muted, and
 * its own soft background.
 */
export type TintTokens = {
  tone1: string;
  tone1Soft: string;
  tone2: string;
  tone2Soft: string;
  /**
   * The literal logo cyan, kept for display type and icon fills.
   *
   * It sits below 4.5:1 on white, so it is deliberately NOT interchangeable
   * with tone2 — anything carrying normal-size text uses tone2 instead.
   */
  tone2Display: string;
  tone3: string;
  tone3Soft: string;
  tone4: string;
  tone4Soft: string;
  urgent: string;
  urgentSoft: string;
};

export type MotionTokens = {
  easeStandard: string;
  durationFast: string;
  durationBase: string;
};

export interface ThemeTokens {
  brand: BrandTokens;
  color: ColorTokens;
  font: FontTokens;
  text: TextScaleTokens;
  weight: WeightTokens;
  space: SpaceTokens;
  radius: RadiusTokens;
  shadow: ShadowTokens;
  motion: MotionTokens;
  tint: TintTokens;
}

/**
 * Exactly what a tenant may reskin. Anything absent from this map is ignored
 * when a tenant override is merged — see `mergeTokens`.
 */
export const OVERRIDABLE_TOKENS = {
  /* A tenant's own artwork is the most visible white-label override there is
     (docs/02-implementation-plan stage 8 asks for two tenants to render
     distinctly by colour AND logo), so the image tokens are overridable. */
  brand: ['name', 'nameAccentSuffix', 'tagline', 'logo', 'logoDark', 'logoWidth', 'logoHeight'],
  color: ['primary', 'primaryHover', 'onPrimary', 'accent', 'accentSoft'],
  font: ['heading'],
} as const satisfies Partial<Record<keyof ThemeTokens, readonly string[]>>;

export type OverridableGroup = keyof typeof OVERRIDABLE_TOKENS;

/** A tenant's partial override set, structurally limited to the brand tokens. */
export type TenantTokenOverrides = {
  [G in OverridableGroup]?: Partial<
    Pick<ThemeTokens[G], Extract<(typeof OVERRIDABLE_TOKENS)[G][number], keyof ThemeTokens[G]>>
  >;
};

/** CSS-variable prefix per token group. An empty prefix yields `--ease-standard`. */
export const GROUP_VAR_PREFIX: Record<keyof ThemeTokens, string> = {
  brand: 'brand',
  color: 'color',
  font: 'font',
  text: 'text',
  weight: 'weight',
  space: 'space',
  radius: 'radius',
  shadow: 'shadow',
  motion: '',
  tint: 'tint',
};
