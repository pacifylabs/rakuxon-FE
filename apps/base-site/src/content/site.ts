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
  { label: 'Services', href: ROUTES.services },
  { label: 'About', href: ROUTES.about },
];

export const LOG_IN_LINK: NavLink = { label: 'Log in', href: LOG_IN };
export const GET_STARTED_LINK: NavLink = { label: 'Get started', href: SIGN_UP };

/* rakuxon.com's real enquiry address. The site previously used a
   hello@ address that does not exist. */
export const CONTACT_EMAIL = 'enquiries@rakuxon.com';

export const CONTACT_PHONES: readonly string[] = ['+234 816 717 8847', '+44 776 094 4935'];

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: 'Get to know us',
    links: [
      { label: 'About', href: ROUTES.about },
      { label: 'How we work', href: `${ROUTES.about}#how-we-work` },
      { label: 'Success stories', href: `${ROUTES.about}#success-stories` },
      { label: 'Contact', href: ROUTES.contact },
    ],
  },
  {
    /* The six real services from rakuxon.com, each anchored on /services. */
    heading: 'Our services',
    links: [
      { label: 'Free consultancy', href: `${ROUTES.services}#free-consultancy` },
      { label: 'University applications', href: `${ROUTES.services}#university-applications` },
      { label: 'Visa support', href: `${ROUTES.services}#visa-support` },
      { label: 'Travels & tourism', href: `${ROUTES.services}#travels-tourism` },
      { label: 'Pre-departure & arrival', href: `${ROUTES.services}#pre-departure` },
      { label: 'Ongoing support', href: `${ROUTES.services}#ongoing-support` },
    ],
  },
  {
    /*
     * rakuxon.com's footer lists "Europe" and "Travel Packages", neither of
     * which is a page here. These are the six country pages that actually
     * exist, so every link resolves.
     */
    heading: 'Destinations',
    links: [
      { label: 'United Kingdom', href: countryRoute('uk') },
      { label: 'United States', href: countryRoute('usa') },
      { label: 'Canada', href: countryRoute('canada') },
      { label: 'Ireland', href: countryRoute('ireland') },
      { label: 'Australia', href: countryRoute('australia') },
      { label: 'All destinations', href: ROUTES.destinations },
    ],
  },
  {
    heading: 'For',
    links: [
      { label: 'Students', href: ROUTES.students },
      { label: 'Agencies', href: ROUTES.agencies },
      { label: 'Institutions', href: ROUTES.institutions },
      { label: 'Explore courses', href: ROUTES.explore },
    ],
  },
];

/** Sits in its own row beneath the columns, as in the rakuxon-care footer. */
export const FOOTER_LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Privacy policy', href: ROUTES.privacy },
  { label: 'Terms of service', href: ROUTES.terms },
];

/** Both real offices. The site previously claimed "Remote-first". */
export const CONTACT_ADDRESSES: readonly string[] = [
  'UK: Flat 15, St. Matthews House, Phelp Street, London SE17 2PJ',
  'Nigeria: 11 Akinsemoyin Street, Surulere, Lagos',
];

/* Real profiles, in rakuxon.com's own order. WhatsApp is first because it is
   the channel the company actually runs on. */
export const SOCIALS: readonly NavLink[] = [
  { label: 'WhatsApp', href: 'https://wa.me/2348167178847' },
  { label: 'Instagram', href: 'https://www.instagram.com/rakuxon' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@rakuxonltd' },
  { label: 'X', href: 'https://x.com/rakuxon' },
  { label: 'Facebook', href: 'https://www.facebook.com/rakuxon' },
  { label: 'YouTube', href: 'https://youtube.com/@rakuxon' },
];

/** Falls back to the brand token; kept explicit so copy edits live in one file. */
export const FOOTER_TAGLINE = 'Where Minds Meet Maps.';

/** rakuxon.com's own footer blurb. */
export const FOOTER_BLURB =
  'Transforming dreams into global education and travel opportunities. Your trusted partner for studying abroad and exploring the world.';
export const FOOTER_DOMAIN = 'rakuxon.com';
