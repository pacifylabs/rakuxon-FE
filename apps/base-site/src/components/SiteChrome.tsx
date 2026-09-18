'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useAuth } from '@rakuxon/auth';
import { Footer, Header } from '@rakuxon/ui';
import type { NavLink } from '@rakuxon/ui';

import { PageBackdrop } from '@/sections/PageBackdrop';

import {
  FOOTER_DOMAIN,
  FOOTER_LEGAL_LINKS,
  GET_STARTED_LINK,
  LOG_IN_LINK,
  buildDestinationLinks,
  buildFooterColumns,
  buildNavLinks,
} from '@/content/site';
import type { ApiSiteSettings } from '@/lib/site-settings/api';

interface ApiCountrySummary {
  countryCode: string;
  country: string;
}

/**
 * Routes that are their own focused screen, not a marketing page.
 *
 * AuthCard already draws a wordmark and its own framing — the marketing
 * header/footer over the top of it is redundant chrome, not navigation the
 * visitor needs mid sign-up. Prefix match, so nested routes (e.g. a future
 * `/dashboard/profile`) inherit the same treatment without being listed here.
 */
const CHROMELESS_PREFIXES = ['/auth', '/dashboard'];

function isChromeless(pathname: string): boolean {
  return CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * The shared marketing shell, present everywhere except the applicant's own
 * screens. `<main id="main">` always renders — the skip link always needs a
 * target, and a document needs exactly one `<main>` whether or not the
 * chrome around it does.
 */
/** Dashboard link shown in place of Log in/Get started once a session is confirmed. */
const SIGNED_IN_LINK: NavLink = { label: 'Dashboard', href: '/dashboard' };

export function SiteChrome({
  children,
  destinations,
  siteSettings,
}: {
  children: ReactNode;
  destinations: readonly ApiCountrySummary[];
  siteSettings: ApiSiteSettings;
}) {
  const pathname = usePathname();
  const chromeless = isChromeless(pathname ?? '');
  const { user, ready } = useAuth();
  /* Before `ready`, storage hasn't been read yet — keep the anonymous CTAs
     rather than flash "Dashboard" and then flip back. */
  const signedInAs = ready && user ? SIGNED_IN_LINK : undefined;
  const destinationLinks = buildDestinationLinks(destinations);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {!chromeless && (
        <>
          <PageBackdrop />
          <Header
            navLinks={buildNavLinks(destinationLinks)}
            logIn={LOG_IN_LINK}
            getStarted={GET_STARTED_LINK}
            signedInAs={signedInAs}
          />
        </>
      )}

      <main id="main">{children}</main>

      {!chromeless && (
        <Footer
          tagline={siteSettings.footerTagline}
          domain={FOOTER_DOMAIN}
          email={siteSettings.contactEmail}
          addresses={siteSettings.contactAddresses}
          phones={siteSettings.contactPhones}
          blurb={siteSettings.footerBlurb}
          columns={buildFooterColumns(destinationLinks)}
          socials={siteSettings.socials}
          legalLinks={FOOTER_LEGAL_LINKS}
        />
      )}
    </>
  );
}
