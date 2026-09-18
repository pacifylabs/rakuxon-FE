import { createResilientJsonFetcher } from '../http/resilient-json';

/**
 * Contact details, social links and footer copy, admin-authored now —
 * replacing what used to be hardcoded in `content/site.ts`. Fails soft to
 * today's real values rather than an empty shape: a marketing page's footer
 * with no contact info at all is a worse failure than one that briefly shows
 * slightly stale (but still correct) details while the API is down.
 */

const BASE_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

const { getJson, reportFailure } = createResilientJsonFetcher({
  baseUrl: `${BASE_URL}/v1/site-settings`,
  logLabel: '[site-settings]',
});

export interface ApiSiteAddress {
  label: string;
  lines: string[];
}

export interface ApiSiteSocial {
  label: string;
  href: string;
}

export interface ApiSiteSettings {
  contactEmail: string;
  contactPhones: string[];
  contactAddresses: ApiSiteAddress[];
  socials: ApiSiteSocial[];
  footerTagline: string;
  footerBlurb: string;
  logoUrl: string;
  logoDarkUrl: string;
}

export const DEFAULT_SITE_SETTINGS: ApiSiteSettings = {
  contactEmail: 'enquiries@rakuxon.com',
  contactPhones: ['+234 816 717 8847', '+44 776 094 4935'],
  contactAddresses: [
    { label: 'UK office', lines: ['Flat 15, St. Matthews House', 'Phelp Street, London SE17 2PJ'] },
    { label: 'Nigeria office', lines: ['11 Akinsemoyin Street', 'Surulere, Lagos'] },
  ],
  socials: [
    { label: 'WhatsApp', href: 'https://wa.me/2348167178847' },
    { label: 'Instagram', href: 'https://www.instagram.com/rakuxon' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@rakuxonltd' },
    { label: 'X', href: 'https://x.com/rakuxon' },
    { label: 'Facebook', href: 'https://www.facebook.com/rakuxon' },
    { label: 'YouTube', href: 'https://youtube.com/@rakuxon' },
  ],
  footerTagline: 'Where Minds Meet Maps.',
  footerBlurb:
    'Transforming dreams into global education and travel opportunities. Your trusted partner for studying abroad and exploring the world.',
  logoUrl: '/logo-light.png',
  logoDarkUrl: '/logo-dark.png',
};

export async function fetchSiteSettings(): Promise<ApiSiteSettings> {
  try {
    return await getJson<ApiSiteSettings>('', 300);
  } catch (error) {
    reportFailure('', error);
    return DEFAULT_SITE_SETTINGS;
  }
}
