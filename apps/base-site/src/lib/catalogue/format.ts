import type { Course, Intake, Money } from './types';

/** "£ 17,500" / "AUD 34,000" — symbol where one is unambiguous, code otherwise. */
const SYMBOLS: Record<string, string> = { GBP: '£', USD: '$', EUR: '€' };

export function formatMoney(money: Money): string {
  const amount = money.amount.toLocaleString('en-GB');
  const symbol = SYMBOLS[money.currency];
  /* AUD and CAD both use "$": showing the code is the only honest option. */
  return symbol ? `${symbol} ${amount}` : `${money.currency} ${amount}`;
}

/** 18 → "1 year 6 months". Months alone read as a puzzle. */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];

  if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} month${rest > 1 ? 's' : ''}`);

  return parts.join(' ') || `${months} months`;
}

export const formatIntake = (intake: Intake) => `${intake.month} ${intake.year}`;

/** The soonest intake still open. Undefined once they have all closed. */
export function nextIntake(course: Course): Intake | undefined {
  return course.intakes.find((intake) => intake.status !== 'closed');
}

/** "06 Jul 2026" — unambiguous for a global audience, unlike 06/07/2026. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Weeks until a deadline; negative once it has passed. */
export const weeksUntil = (iso: string, now = Date.now()) =>
  Math.round((new Date(iso).getTime() - now) / 604_800_000);

/**
 * "Manchester, United Kingdom" — but never "Ireland, Ireland".
 *
 * The registry's location name is sometimes the country rather than a city,
 * for institutions with no single campus. Joining blindly then prints the same
 * word twice, which reads as a bug because it is one.
 */
export function formatLocation(city: string | null | undefined, country: string): string {
  const trimmed = city?.trim();
  if (!trimmed || trimmed.toLowerCase() === country.trim().toLowerCase()) return country;
  return `${trimmed}, ${country}`;
}
