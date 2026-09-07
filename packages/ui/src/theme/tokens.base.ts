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
  },

  color: {
    /* Brand — the Modern Campus direction */
    primary: '#143D28', // deep forest green, 12.15:1 on white
    primaryHover: '#1C5537', // lighter on hover: the base is already near-black
    onPrimary: '#FFFFFF',
    accent: '#1572FE', // electric sky blue, 4.31:1 on white
    accentSoft: '#E7F0FE',

    /* Neutrals */
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#E2E6EE', // soft sage-grey, easy on the eyes over long reads
    text: '#0E1F16', // near-black with a green undertone
    textMuted: '#4A5A52',
    textInverse: '#FFFFFF',
    border: '#CFD6E0',

    /* Scheme-invariant: see TintTokens' sibling note in tokens.types.ts. */
    scrim: '#0E1F16',
    onScrim: '#FFFFFF',

    /*
     * State — not tenant-overridable.
     *
     * success and info were retuned away from the 04a values: the old info
     * (#4A7DE1) was visually the same blue as the new accent, and the old
     * success (#2FA36B) sat in the primary's green family. Both now clear
     * 4.5:1 on white AND on --color-surface-muted.
     *
     * warning and danger keep their 04a values. Both are fill/icon colours:
     * warning is 2.19:1 and danger 3.91:1 on white, so neither may be used
     * for normal-size text. Pair them with --color-text for labels.
     */
    success: '#12703C',
    warning: '#E6A23C',
    danger: '#E5484D',
    info: '#0B5F73',
    focusRing: '#1572FE',
  },

  font: {
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
    tone1: '#175C3A', // forest, 7.99:1
    tone1Soft: '#E6F1EB',
    tone2: '#1258C4', // sky, 6.52:1
    tone2Soft: '#E7F0FE',
    tone3: '#0E6E62', // teal, 6.13:1
    tone3Soft: '#E4F1EF',
    tone4: '#3F4C7A', // slate, 8.31:1
    tone4Soft: '#EAEDF6',
    urgent: '#A8480B', // amber-orange, 5.84:1 — deadlines only
    urgentSoft: '#FDF0E6',
  },
};
