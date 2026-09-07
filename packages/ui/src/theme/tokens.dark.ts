import { baseTokens } from './tokens.base';
import type { ThemeTokens } from './tokens.types';

/**
 * The dark scheme.
 *
 * Only colour, tint and shadow move — type, space, radius and motion are one
 * system in both schemes. Every foreground here clears 4.5:1 against all three
 * dark surfaces (bg, surface and surface-muted), asserted in theme.test.tsx
 * rather than eyeballed.
 *
 * Note `onPrimary` inverts: the dark primary is light enough that white on it
 * is only 2.2:1, so text on a primary button becomes near-black. That is
 * exactly what the token is for.
 */
export const darkTokens: ThemeTokens = {
  ...baseTokens,

  color: {
    /* Brand — the logo cobalt lifted until it reads on a dark ground. */
    primary: '#7FAAFF',
    primaryHover: '#9CBEFF',
    onPrimary: '#0B1220',
    accent: '#6FC5FF',
    accentSoft: '#152238',

    /* Neutrals, blue-undertoned to match */
    bg: '#0B1220',
    surface: '#111A2B',
    surfaceMuted: '#1A2537',
    text: '#E8EDF7',
    textMuted: '#A5B2C9',
    textInverse: '#0B1220',
    border: '#2A3648',

    /* Deliberately identical to light: a photograph does not invert. */
    scrim: '#0B1729',
    onScrim: '#FFFFFF',

    /* State */
    success: '#4ECB86',
    warning: '#F0B45C',
    danger: '#FF7B80',
    info: '#4FBEDC',
    focusRing: '#6FC5FF',
  },

  tint: {
    tone1: '#8FB4FF',
    tone1Soft: '#151F33',
    tone2: '#6FC5FF',
    tone2Soft: '#152238',
    /* Already light enough to read here, so display and text share a value. */
    tone2Display: '#6FC5FF',
    tone3: '#5CC8BC',
    tone3Soft: '#12292B',
    tone4: '#9AA6E0',
    tone4Soft: '#1E2338',
    urgent: '#F5A25E',
    urgentSoft: '#2E2118',
  },

  /* Shadows carry less weight on dark ground; borders do the separating. */
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,.4)',
    md: '0 6px 20px rgba(0,0,0,.45)',
    lg: '0 16px 40px rgba(0,0,0,.5)',
  },
};
