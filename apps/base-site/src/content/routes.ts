/**
 * Every route this site serves. The single source of truth for links.
 *
 * `page-links.test.tsx` walks the rendered markup of every page and asserts
 * that each internal href resolves to something in here, so a dead link fails
 * the build rather than shipping.
 */

export const COUNTRY_SLUGS = ['uk', 'canada', 'usa', 'ireland', 'australia', 'germany'] as const;

export type CountrySlug = (typeof COUNTRY_SLUGS)[number];

export const ROUTES = {
  home: '/',
  students: '/students',
  agencies: '/agencies',
  institutions: '/institutions',
  services: '/services',
  universities: '/universities',
  explore: '/explore',
  destinations: '/destinations',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export const countryRoute = (slug: CountrySlug) => `/destinations/${slug}` as const;

/**
 * 04b § 1 hands /login and /register to the product apps, which do not exist
 * yet. Rather than ship two dead links, both CTAs land on the contact page
 * with the role pre-selected. Swap these two values when auth goes live.
 */
export const SIGN_UP = `${ROUTES.contact}?intent=signup`;
export const LOG_IN = `${ROUTES.contact}?intent=login`;

/** All valid pathnames, for link verification. */
export const ALL_ROUTES: readonly string[] = [
  ...Object.values(ROUTES),
  ...COUNTRY_SLUGS.map(countryRoute),
];
