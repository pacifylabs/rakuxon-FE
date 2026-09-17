'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useAuth } from '@rakuxon/auth';
import { Footer, Header } from '@rakuxon/ui';
import type { NavLink } from '@rakuxon/ui';

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

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chromeless = isChromeless(pathname ?? '');
  const { user, ready } = useAuth();
  /* Before `ready`, storage hasn't been read yet — keep the anonymous CTAs
     rather than flash "Dashboard" and then flip back. */
  const signedInAs = ready && user ? SIGNED_IN_LINK : undefined;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {!chromeless && (
        <>
          <PageBackdrop />
          <Header
            navLinks={NAV_LINKS}
            logIn={LOG_IN_LINK}
            getStarted={GET_STARTED_LINK}
            signedInAs={signedInAs}
          />
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
