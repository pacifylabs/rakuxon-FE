import clsx from 'clsx';

export interface CountryFlagProps {
  /** ISO 3166-1 alpha-2, e.g. "IN". Anything else renders the code itself. */
  countryCode?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const REGIONAL_INDICATOR_A = 0x1f1e6;
const LETTER_A = 'A'.charCodeAt(0);

/**
 * Turns "IN" into 🇮🇳.
 *
 * A flag emoji is a pair of regional-indicator letters, so this is pure string
 * maths — no image, no request, no licence. Returns null for anything that is
 * not two ASCII letters, which is what the registry gives for organisations
 * with no resolved country.
 */
export function flagEmoji(countryCode?: string): string | null {
  const code = countryCode?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;

  return String.fromCodePoint(
    ...[...code].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A),
  );
}

const SIZE_CLASSES = {
  /* Dropdown rows: a 40px flag would outweigh the name beside it. */
  sm: 'h-6 w-6 text-sm',
  md: 'h-10 w-10 text-xl',
  lg: 'h-12 w-12 text-2xl',
} as const;

/**
 * The country flag for an institution or course.
 *
 * Decorative: every card names the country in text beside it, so announcing it
 * twice would only slow a screen reader down.
 *
 * Platforms without flag glyphs — Windows Chrome, most notably — render the two
 * regional-indicator letters instead. That degrades to the country code, which
 * is still meaningful, so no detection is attempted.
 *
 * With no resolvable country it shows the raw code, or nothing. It used to fall
 * back to a generic building icon, which was worse than empty: the same glyph
 * repeated down a grid says nothing the heading has not already said, and it
 * reads as a real mark rather than as missing data.
 */
export function CountryFlag({ countryCode, size = 'md', className }: CountryFlagProps) {
  const flag = flagEmoji(countryCode);
  const code = countryCode?.trim().toUpperCase();

  if (!flag && !code) return null;

  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-full border border-border bg-surface leading-none',
        SIZE_CLASSES[size],
        flag ? '' : 'text-xs font-semibold tracking-tight text-text-muted',
        className,
      )}
    >
      {flag ?? code}
    </span>
  );
}
