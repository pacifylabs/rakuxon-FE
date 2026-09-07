import type { ThemeTokens } from './tokens.types';

/**
 * The base Rakuxon theme — the single place a raw value may appear.
 * Values transcribed from docs/04a-landing-and-design-system.md § 3.
 */
export const baseTokens: ThemeTokens = {
  brand: {
    name: 'Rakuxon',
    /* One word, so no slice is painted in the accent tone. */
    nameAccentSuffix: '',
    tagline: 'Where Minds Meet Maps.',
    /*
     * No logo here on purpose. These tokens are shared by five apps, and only
     * the app that ships the file in its own public/ can serve it — pointing
     * at /logo.png from packages/ui would 404 in the four that do not. Each app
     * supplies its own through ThemeProvider, exactly as a white-label tenant
     * does, and anything without one falls back to the drawn LogoMark.
     */
  },

  color: {
    /*
     * Brand — sampled from the logo (apps/base-site/public/logo.png).
     *
     * The wordmark is cobalt with a cyan road-arrow. Cobalt carries the brand
     * at 9.30:1 on white, so it works for text, buttons and icons alike.
     *
     * The logo's raw cyan (#0090F8) is only 3.31:1 on white — below 4.5:1, so
     * it cannot legally carry normal-size text. `accent` is that cyan darkened
     * to the point where it clears 4.5:1 on white AND on surface-muted; the
     * literal logo cyan survives as `tint.tone2Display` for large display and
     * icon fills only.
     */
    primary: '#0038B8', // logo cobalt, 9.30:1 on white
    primaryHover: '#0D42C8', // lighter on hover, still 7.98:1
    onPrimary: '#FFFFFF',
    accent: '#0068B4', // logo cyan, darkened to 5.77:1 white / 4.61:1 muted
    accentSoft: '#E3F0FD',

    /* Neutrals */
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#E2E6EE', // soft sage-grey, easy on the eyes over long reads
    text: '#0B1729', // near-black with a blue undertone
    textMuted: '#46536B',
    textInverse: '#FFFFFF',
    border: '#CFD6E0',

    /* Scheme-invariant: see TintTokens' sibling note in tokens.types.ts. */
    scrim: '#0B1729',
    onScrim: '#FFFFFF',

    /*
     * State — not tenant-overridable.
     *
     * success and info were retuned away from the 04a values, and the move to
     * a cobalt brand improves one of them: with the primary no longer green,
     * `success` is the only green on the page, so it reads as a signal instead
     * of as brand decoration. Both clear 4.5:1 on white AND surface-muted.
     *
     * warning and danger keep their 04a values. Both are fill/icon colours:
     * warning is 2.19:1 and danger 3.91:1 on white, so neither may be used
     * for normal-size text. Pair them with --color-text for labels.
     */
    success: '#12703C',
    warning: '#E6A23C',
    danger: '#E5484D',
    info: '#0B5F73',
    focusRing: '#0068B4',
  },

  font: {
    serif: 'ui-serif, Georgia, "Times New Roman", serif',
    sans: 'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    heading: 'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  },

  text: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '22px',
    '2xl': '28px',
    '3xl': '36px',
    '4xl': '48px',
    hero: '60px',
  },

  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /* 4px base scale */
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 2px rgba(26,24,48,.06)',
    md: '0 6px 20px rgba(26,24,48,.08)',
    lg: '0 16px 40px rgba(26,24,48,.10)',
  },

  motion: {
    easeStandard: 'cubic-bezier(.4,0,.2,1)',
    durationFast: '150ms',
    durationBase: '250ms',
  },

  /*
   * Decorative tints. Not state colours — see TintTokens.
   *
   * tone1–tone4 are named for their slot rather than their hue, so a palette
   * change revalues them without renaming an API. `urgent` is the exception:
   * it is semantic, reserved for deadlines and time pressure, and must not be
   * used decoratively or it stops reading as a signal.
   *
   * Every foreground clears 4.5:1 on white and on --color-surface-muted.
   */
  tint: {
    tone1: '#1746C4', // cobalt, 7.75:1
    tone1Soft: '#E5EBFA',
    tone2: '#0068B4', // sky, 5.77:1
    tone2Soft: '#E1EFFB',
    /* The literal logo cyan. Display sizes and icon fills only — 3.31:1 on
       white is below the 4.5:1 that normal-size text needs. */
    tone2Display: '#0090F8',
    tone3: '#0E6E62', // teal, 6.13:1
    tone3Soft: '#E4F1EF',
    tone4: '#3F4C7A', // slate, 8.31:1
    tone4Soft: '#EAEDF6',
    urgent: '#A8480B', // amber-orange, 5.84:1 — deadlines only
    urgentSoft: '#FDF0E6',
  },
};
