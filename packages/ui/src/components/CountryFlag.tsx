import clsx from 'clsx';
import { Building2 } from 'lucide-react';

import { IconBubble } from './IconBubble';
import type { IconBubbleTone } from './IconBubble';

export interface CountryFlagProps {
  /** ISO 3166-1 alpha-2, e.g. "IN". Anything else falls back to the icon. */
  countryCode?: string;
  /** Tone for the fallback bubble, so it matches its neighbours. */
  fallbackTone?: IconBubbleTone;
  size?: 'md' | 'lg';
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
  md: 'h-10 w-10 text-xl',
  lg: 'h-12 w-12 text-2xl',
} as const;

/**
 * The country flag for an institution, in the same slot its icon occupied.
 *
 * Decorative: every card already names the country in text beside it, so
 * announcing it twice would only slow a screen reader down.
 *
 * Platforms without flag glyphs — Windows Chrome, most notably — render the
 * two regional-indicator letters instead. That degrades to the country code,
 * which is still meaningful, so no detection is attempted.
 */
export function CountryFlag({
  countryCode,
  fallbackTone = 'tone1',
  size = 'md',
  className,
}: CountryFlagProps) {
  const flag = flagEmoji(countryCode);

  if (!flag) {
    return <IconBubble icon={Building2} tone={fallbackTone} size={size} className={className} />;
  }

  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-full border border-border bg-surface leading-none',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {flag}
    </span>
  );
}
