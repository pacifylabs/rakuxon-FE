import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import { AuthProvider } from '@rakuxon/auth';
import { Footer, Header, ThemeProvider } from '@rakuxon/ui';

import {
  BRAND_LOGO_SIZE,
  FOOTER_DOMAIN,
  FOOTER_LEGAL_LINKS,
  GET_STARTED_LINK,
  LOG_IN_LINK,
  buildDestinationLinks,
  buildFooterColumns,
  buildNavLinks,
} from '@/content/site';
import { DEFAULT_SITE_SETTINGS } from '@/lib/site-settings/api';

/* No live countries in tests — same fails-soft shape production falls back
   to when the catalogue is unreachable (see `SiteChrome`). */
const TEST_DESTINATION_LINKS = buildDestinationLinks([]);

/**
 * Renders a page inside the same shell app/layout.tsx provides, so a page test
 * can assert on real landmarks rather than a bare fragment.
 *
 * Wrapped in `AuthProvider` because `layout.tsx` really does wrap every page
 * in one (via `SessionProvider`) — a component reached from here that calls
 * `useAuth()`/`useApiClient()` (the header itself, or a course card's apply
 * action) needs the same context in the test as it has in production.
 */
export function renderPage(page: ReactElement) {
  return render(
    <AuthProvider baseUrl="https://api.test">
      <ThemeProvider
        tokens={{
          brand: {
            logo: DEFAULT_SITE_SETTINGS.logoUrl,
            logoDark: DEFAULT_SITE_SETTINGS.logoDarkUrl,
            logoWidth: BRAND_LOGO_SIZE.width,
            logoHeight: BRAND_LOGO_SIZE.height,
          },
        }}
      >
        <Header
          navLinks={buildNavLinks(TEST_DESTINATION_LINKS)}
          logIn={LOG_IN_LINK}
          getStarted={GET_STARTED_LINK}
        />
        <main id="main">{page}</main>
        <Footer
          tagline={DEFAULT_SITE_SETTINGS.footerTagline}
          domain={FOOTER_DOMAIN}
          email={DEFAULT_SITE_SETTINGS.contactEmail}
          addresses={DEFAULT_SITE_SETTINGS.contactAddresses}
          phones={DEFAULT_SITE_SETTINGS.contactPhones}
          blurb={DEFAULT_SITE_SETTINGS.footerBlurb}
          columns={buildFooterColumns(TEST_DESTINATION_LINKS)}
          socials={DEFAULT_SITE_SETTINGS.socials}
          legalLinks={FOOTER_LEGAL_LINKS}
        />
      </ThemeProvider>
    </AuthProvider>,
  );
}

/** Every internal href in the rendered output, normalised to a pathname. */
export function internalPaths(container: HTMLElement): string[] {
  return [...container.querySelectorAll('a[href]')]
    .map((anchor) => anchor.getAttribute('href') ?? '')
    .filter((href) => href.startsWith('/'))
    .map((href) => (href.split(/[?#]/)[0] as string) || '/');
}
