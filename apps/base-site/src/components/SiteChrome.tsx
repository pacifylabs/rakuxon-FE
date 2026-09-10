'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Footer, Header } from '@rakuxon/ui';

import { PageBackdrop } from '@/sections/PageBackdrop';

import {
  CONTACT_ADDRESSES,
  CONTACT_PHONES,
  FOOTER_BLURB,
  CONTACT_EMAIL,
  FOOTER_COLUMNS,
  FOOTER_DOMAIN,
  FOOTER_LEGAL_LINKS,
  FOOTER_TAGLINE,
  GET_STARTED_LINK,
  LOG_IN_LINK,
  NAV_LINKS,
  SOCIALS,
} from '@/content/site';

/**
 * Routes that are their own focused screen, not a marketing page.
 *
 * AuthCard already draws a wordmark and its own framing — the marketing
 * header/footer over the top of it is redundant chrome, not navigation the
 * visitor needs mid sign-up. Prefix match, so nested routes (e.g. a future
 * `/dashboard/profile`) inherit the same treatment without being listed here.
 */
const CHROMELESS_PREFIXES = [
  '/register',
  '/login',
  '/invite',
  '/sso',
  '/dashboard',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * The shared marketing shell, present everywhere except the applicant's own
 * screens. `<main id="main">` always renders — the skip link always needs a
 * target, and a document needs exactly one `<main>` whether or not the
 * chrome around it does.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chromeless = isChromeless(pathname ?? '');

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {!chromeless && (
        <>
          <PageBackdrop />
          <Header navLinks={NAV_LINKS} logIn={LOG_IN_LINK} getStarted={GET_STARTED_LINK} />
        </>
      )}

      <main id="main">{children}</main>

      {!chromeless && (
        <Footer
          tagline={FOOTER_TAGLINE}
          domain={FOOTER_DOMAIN}
          email={CONTACT_EMAIL}
          addresses={CONTACT_ADDRESSES}
          phones={CONTACT_PHONES}
          blurb={FOOTER_BLURB}
          columns={FOOTER_COLUMNS}
          socials={SOCIALS}
          legalLinks={FOOTER_LEGAL_LINKS}
        />
      )}
    </>
  );
}
