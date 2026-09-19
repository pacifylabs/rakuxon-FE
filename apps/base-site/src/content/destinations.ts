import type { DestinationCard } from '@rakuxon/contract';

import { ROUTES, SIGN_UP, countryRoute } from './routes';
import type { CountrySlug } from './routes';

/**
 * /destinations and /destinations/[country] read the written guides from the
 * `destinations` admin CMS module now — see `lib/destinations/api.ts`. What
 * stays here is presentation-only: the fixed ISO-code-to-guide-slug mapping
 * (so a catalogue country can link to its guide), and the index/CTA copy
 * that isn't per-country.
 */

export const DESTINATIONS_INDEX = {
  eyebrow: 'Study destinations',
  /* Not "six countries" — the grid is built from the catalogue, so the number
     changes whenever a country is published. Naming it here guarantees the
     heading will eventually contradict the page under it. */
  title: 'Every destination we can get you into.',
  subcopy:
    'Cost, course length, work rights and what happens after you graduate vary more than most rankings suggest. Some have a full written guide; the rest open straight into their universities.',
} as const;

export const DESTINATIONS_CTA = {
  heading: 'Not sure which country fits?',
  subline: 'Tell us your budget, your field and where you want to end up. We will narrow it down.',
  cta: { label: 'Get a shortlist', href: SIGN_UP },
  reassurance: 'Free, and no obligation to apply anywhere.',
} as const;

export const UNIVERSITIES_ROUTE = ROUTES.universities;

/**
 * Used only when a published guide has no hero photo of its own yet — nothing
 * in the admin editor requires one before publishing. The detail page's hero
 * band needs a real image, so this stands in rather than the page crashing.
 */
export const DESTINATION_FALLBACK_IMAGE = {
  src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80',
  alt: 'Students walking across a university campus',
} as const;

/** Maps a catalogue country's ISO code to its written-guide slug, where one exists. */
export const GUIDE_BY_CODE: Record<string, CountrySlug> = {
  GB: 'uk',
  CA: 'canada',
  US: 'usa',
  IE: 'ireland',
  AU: 'australia',
  DE: 'germany',
};

export interface DestinationCardContent {
  country: string;
  href: string;
  src?: string;
  alt?: string;
  description: string;
}

/**
 * The card content for one catalogue destination — a written guide's own
 * photo and tagline where one exists, a plain flag-on-a-name card (via
 * `DestinationCard`'s own fallback) with an institution count otherwise.
 *
 * Shared between /destinations and any other surface that teases
 * destinations — the dashboard home page, most notably — so a guide added
 * for one shows up consistently everywhere a country card renders. `guides`
 * is keyed by guide slug; callers with no guide data on hand (widgets that
 * only render the catalogue fallback) can omit it.
 */
export function destinationCardContent(
  entry: { countryCode: string; country: string; institutions: number },
  guides: Record<string, DestinationCard> = {},
): DestinationCardContent {
  const guideSlug = GUIDE_BY_CODE[entry.countryCode];
  const written = guideSlug ? guides[guideSlug] : undefined;

  return {
    country: written?.shortName ?? entry.country,
    href: guideSlug
      ? countryRoute(guideSlug)
      : `${ROUTES.universities}?country=${entry.countryCode}`,
    src: written?.cardImageUrl ?? undefined,
    alt: written?.cardImageAlt,
    description:
      written?.tagline ??
      `${entry.institutions.toLocaleString('en-GB')} universit${
        entry.institutions === 1 ? 'y' : 'ies'
      } in the catalogue.`,
  };
}
