import type { FooterColumn, NavLink } from '@rakuxon/ui';

import { LOG_IN, ROUTES, SIGN_UP, countryRoute } from './routes';

/** Global shell content (docs/04b § 2), shared by every page. */

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Students', href: ROUTES.students },
  { label: 'Agencies', href: ROUTES.agencies },
  { label: 'Institutions', href: ROUTES.institutions },
  { label: 'Explore', href: ROUTES.explore },
  { label: 'Universities', href: ROUTES.universities },
  { label: 'Destinations', href: ROUTES.destinations },
  { label: 'About', href: ROUTES.about },
];

export const LOG_IN_LINK: NavLink = { label: 'Log in', href: LOG_IN };
export const GET_STARTED_LINK: NavLink = { label: 'Get started', href: SIGN_UP };

export const CONTACT_EMAIL = 'hello@rakuxon.com';

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: 'Get to know us',
    links: [
      { label: 'About', href: ROUTES.about },
      { label: 'How we work', href: `${ROUTES.about}#how-we-work` },
      { label: 'Contact', href: ROUTES.contact },
      { label: 'Careers', href: `${ROUTES.about}#careers` },
    ],
  },
  {
    heading: 'For',
    links: [
      { label: 'Students', href: ROUTES.students },
      { label: 'Agencies', href: ROUTES.agencies },
      { label: 'Institutions', href: ROUTES.institutions },
    ],
  },
  {
    heading: 'Destinations',
    links: [
      { label: 'United Kingdom', href: countryRoute('uk') },
      { label: 'Canada', href: countryRoute('canada') },
      { label: 'United States', href: countryRoute('usa') },
      { label: 'Australia', href: countryRoute('australia') },
      { label: 'All destinations', href: ROUTES.destinations },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Courses', href: `${ROUTES.explore}?tab=courses` },
      { label: 'Explore', href: ROUTES.explore },
      { label: 'Universities', href: ROUTES.universities },
      { label: 'Articles', href: `${ROUTES.explore}?tab=articles` },
      { label: 'Destinations', href: ROUTES.destinations },
    ],
  },
];

/** Sits in its own row beneath the columns, as in the rakuxon-care footer. */
export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Privacy policy', href: ROUTES.privacy },
  { label: 'Terms of service', href: ROUTES.terms },
];

export const CONTACT_ADDRESS = 'Remote-first · United Kingdom';

export const SOCIALS: readonly NavLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'X', href: 'https://x.com' },
];

/** Falls back to the brand token; kept explicit so copy edits live in one file. */
export const FOOTER_TAGLINE = 'Where Minds Meet Maps.';
export const FOOTER_DOMAIN = 'rakuxon.com';
