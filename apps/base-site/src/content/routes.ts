import { COURSES, INSTITUTIONS } from '@/lib/catalogue/bank';

/**
 * The six real, admin-authored services' stable slugs — kept here rather than
 * fetched, since this file must stay a synchronous, importable constant (see
 * `content/site.ts`'s own `SERVICE_LINKS` for the same tradeoff).
 */
const SERVICE_SLUGS = [
  'free-consultancy',
  'university-applications',
  'visa-support',
  'pre-departure',
  'ongoing-support',
  'travels-tourism',
] as const;

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
  resources: '/resources',
  testimonials: '/testimonials',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  register: '/auth/register',
  login: '/auth/login',
  dashboard: '/dashboard',
  /** Prefix only — the real path always carries a token: `/auth/invite/${token}`. */
  invite: '/auth/invite',
  forgotPassword: '/auth/forgot-password',
  /** Prefix only — the real path always carries a token: `/auth/reset-password/${token}`. */
  resetPassword: '/auth/reset-password',
  /** Prefix only — the real path always carries a token: `/auth/verify-email/${token}`. */
  verifyEmail: '/auth/verify-email',
} as const;

export const countryRoute = (slug: CountrySlug) => `/destinations/${slug}` as const;

/** Catalogue detail pages. Slugs come from the bank, so these are open-ended. */
export const courseRoute = (slug: string) => `/courses/${slug}`;
export const universityRoute = (slug: string) => `/universities/${slug}`;
export const articleRoute = (slug: string) => `/resources/${slug}`;
export const serviceRoute = (id: string) => `/services/${id}`;

export const SIGN_UP = ROUTES.register;

/**
 * Agencies register in a separate app (`partner-app`), not on this site — a
 * different session, a different dashboard. Absolute by necessity, so it
 * never needs to appear in `ALL_ROUTES`: `internalPaths()` in
 * `src/lib/page-harness.tsx`, which that list exists to check against, only
 * collects hrefs starting with `/`.
 */
export const PARTNER_SIGN_UP = `${process.env.NEXT_PUBLIC_PARTNER_APP_URL ?? 'http://localhost:3002'}/auth/register`;

/**
 * Apply, carrying what the visitor was looking at.
 *
 * The choice travels in the query string so registration opens already knowing
 * the course or university. Asking someone to find it a second time, on the
 * step where they are most likely to leave, is how an application is lost.
 * One helper, so every button spells the parameters the same way.
 */
export const applyHref = (selection: { course?: string; university?: string }) => {
  const params = new URLSearchParams();
  if (selection.course) params.set('course', selection.course);
  if (selection.university) params.set('university', selection.university);
  const query = params.toString();
  return query ? `${ROUTES.register}?${query}` : ROUTES.register;
};
export const LOG_IN = ROUTES.login;

/**
 * All valid pathnames, for link verification.
 *
 * Catalogue detail pages are included from the bank rather than hard-coded, so
 * a course whose slug changes takes its links with it and `page-links` catches
 * the break instead of shipping a 404.
 */
export const ALL_ROUTES: readonly string[] = [
  ...Object.values(ROUTES),
  ...COUNTRY_SLUGS.map(countryRoute),
  ...COURSES.map((course) => courseRoute(course.slug)),
  ...INSTITUTIONS.map((institution) => universityRoute(institution.slug)),
  ...SERVICE_SLUGS.map((slug) => serviceRoute(slug)),
];
