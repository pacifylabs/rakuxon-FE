import type { FooterColumn, NavLink } from '@rakuxon/ui';

import { GUIDE_BY_CODE } from './destinations';
import { LOG_IN, ROUTES, SIGN_UP, countryRoute, serviceRoute } from './routes';

/**
 * The six real services, admin-authored now (see `lib/services/api.ts`) —
 * but the nav and footer render synchronously with no fetch, so their
 * title/slug pairs are pinned here rather than derived. A renamed or
 * reordered service on the admin side does not update these two labels
 * until this list is edited to match, same as the footer column below.
 */
const SERVICE_LINKS: readonly { title: string; slug: string }[] = [
  { title: 'Free Educational Consultancy', slug: 'free-consultancy' },
  { title: 'University Selection & Application', slug: 'university-applications' },
  { title: 'Visa Application Support', slug: 'visa-support' },
  { title: 'Pre-departure & Arrival Support', slug: 'pre-departure' },
  { title: 'Ongoing Client Support', slug: 'ongoing-support' },
  { title: 'Travels and Tourism', slug: 'travels-tourism' },
];

/** Global shell content (docs/04b § 2), shared by every page. */

/**
 * The country menu, with the flag beside each name — built from whatever the
 * admin-enabled catalogue actually holds (see `lib/catalogue/api.ts`'s
 * `fetchCountries()`), not a hardcoded list. A country with a written guide
 * (`GUIDE_BY_CODE`, `content/destinations.ts`) links to it; every other
 * enabled country links to the catalogue pre-filtered to it, same as
 * `/destinations`'s own cards do via `destinationCardContent()`.
 */
export function buildDestinationLinks(
  destinations: readonly { countryCode: string; country: string }[],
): NavLink[] {
  return [
    ...destinations.map((entry) => {
      const guide = GUIDE_BY_CODE[entry.countryCode];
      return {
        label: entry.country,
        href: guide ? countryRoute(guide) : `${ROUTES.universities}?country=${entry.countryCode}`,
        countryCode: entry.countryCode,
      };
    }),
    { label: 'All destinations', href: ROUTES.destinations },
  ];
}

export function buildNavLinks(destinationLinks: readonly NavLink[]): NavLink[] {
  return [
    /*
     * Universities is the catalogue listing; Destinations is the same catalogue
     * chosen by country, which is how most applicants start. Courses are not a
     * top-level entry: a course belongs to a university, so the way in is the
     * university page or the search bar, not a third door into the same rows.
     *
     * Students and Agents are the two audiences who arrive cold and need a page
     * written for them. Institutions is in the footer instead — that audience
     * arrives through a conversation or a direct link, not by browsing a menu.
     */
    { label: 'Universities', href: ROUTES.universities },
    { label: 'Destinations', href: ROUTES.destinations, children: destinationLinks },
    { label: 'Students', href: ROUTES.students },
    { label: 'Agents', href: ROUTES.agencies },
    {
      label: 'Services',
      href: ROUTES.services,
      children: SERVICE_LINKS.map((service) => ({
        label: service.title,
        href: serviceRoute(service.slug),
      })),
    },
    /* "Guidance" named the shelf rather than what is on it; these are articles a
       student reads before applying. */
    { label: 'Study guides', href: ROUTES.resources },
    { label: 'About', href: ROUTES.about },
  ];
}

export const LOG_IN_LINK: NavLink = { label: 'Log in', href: LOG_IN };
export const GET_STARTED_LINK: NavLink = { label: 'Get started', href: SIGN_UP };

export function buildFooterColumns(destinationLinks: readonly NavLink[]): FooterColumn[] {
  return [
    {
      heading: 'Get to know us',
      links: [
        { label: 'About', href: ROUTES.about },
        { label: 'How we work', href: `${ROUTES.about}#how-we-work` },
        { label: 'Success stories', href: ROUTES.testimonials },
        { label: 'Contact', href: ROUTES.contact },
      ],
    },
    {
      /* The six real services from rakuxon.com, each with its own page. */
      heading: 'Our services',
      links: [
        { label: 'Free consultancy', href: serviceRoute('free-consultancy') },
        { label: 'University applications', href: serviceRoute('university-applications') },
        { label: 'Visa support', href: serviceRoute('visa-support') },
        { label: 'Travels & tourism', href: serviceRoute('travels-tourism') },
        { label: 'Pre-departure & arrival', href: serviceRoute('pre-departure') },
        { label: 'Ongoing support', href: serviceRoute('ongoing-support') },
      ],
    },
    {
      /* Whatever the admin has actually enabled — see `buildDestinationLinks`. */
      heading: 'Destinations',
      links: destinationLinks,
    },
    {
      heading: 'For',
      links: [
        { label: 'Students', href: ROUTES.students },
        { label: 'Agencies', href: ROUTES.agencies },
        { label: 'Institutions', href: ROUTES.institutions },
        { label: 'Explore courses', href: ROUTES.explore },
        { label: 'Study guides', href: ROUTES.resources },
      ],
    },
  ];
}

/** Sits in its own row beneath the columns, as in the rakuxon-care footer. */
export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Privacy policy', href: ROUTES.privacy },
  { label: 'Terms of service', href: ROUTES.terms },
];

/**
 * The logo's intrinsic pixel size, so `next/image` can reserve the box.
 *
 * Kept as a frontend constant rather than admin-editable: it describes the
 * artwork's own dimensions, not content — the admin-uploaded `logoUrl`/
 * `logoDarkUrl` (see `lib/site-settings/api.ts`) are expected to share it.
 */
export const BRAND_LOGO_SIZE = { width: '1200', height: '400' } as const;

export const FOOTER_DOMAIN = 'rakuxon.com';
