import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Footer, Header, ThemeProvider, baseTokens, themeScript } from '@rakuxon/ui';

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

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const description =
  'Research, plan, apply, and track your international education — all in one place. Apply with confidence and turn your goals into offers.';

export const metadata: Metadata = {
  title: {
    default: `${baseTokens.brand.name} — ${baseTokens.brand.tagline.replace(/\.$/, '')}`,
    template: `%s · ${baseTokens.brand.name}`,
  },
  description,
  openGraph: {
    title: `${baseTokens.brand.name} — ${baseTokens.brand.tagline.replace(/\.$/, '')}`,
    description,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: baseTokens.color.primary,
};

/**
 * Global shell for every marketing page (docs/04b § 2). The header and footer
 * live here so a new page only supplies its own sections.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Applies the saved scheme before first paint, so the page never renders
          light and then flips. It must run before the body, hence inline here.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* No tenant overrides on the public site — always the base theme. */}
        <ThemeProvider>
          <a className="skip-link" href="#main">
            Skip to main content
          </a>

          <Header navLinks={NAV_LINKS} logIn={LOG_IN_LINK} getStarted={GET_STARTED_LINK} />

          <main id="main">{children}</main>

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
        </ThemeProvider>
      </body>
    </html>
  );
}
