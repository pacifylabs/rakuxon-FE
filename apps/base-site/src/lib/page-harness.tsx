import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

import { Footer, Header, ThemeProvider } from '@rakuxon/ui';

import {
  BRAND_LOGO,
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
 * Renders a page inside the same shell app/layout.tsx provides, so a page test
 * can assert on real landmarks rather than a bare fragment.
 */
export function renderPage(page: ReactElement) {
  return render(
    <ThemeProvider tokens={{ brand: BRAND_LOGO }}>
      <Header navLinks={NAV_LINKS} logIn={LOG_IN_LINK} getStarted={GET_STARTED_LINK} />
      <main id="main">{page}</main>
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
    </ThemeProvider>,
  );
}

/** Every internal href in the rendered output, normalised to a pathname. */
export function internalPaths(container: HTMLElement): string[] {
  return [...container.querySelectorAll('a[href]')]
    .map((anchor) => anchor.getAttribute('href') ?? '')
    .filter((href) => href.startsWith('/'))
    .map((href) => (href.split(/[?#]/)[0] as string) || '/');
}
