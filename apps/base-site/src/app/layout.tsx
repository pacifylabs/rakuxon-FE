import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider, baseTokens, themeScript } from '@rakuxon/ui';

import { SessionProvider } from '@/components/SessionProvider';
import { SiteChrome } from '@/components/SiteChrome';

import { BRAND_LOGO, CONTACT_EMAIL, CONTACT_PHONES, SOCIALS } from '@/content/site';
import { ROUTES } from '@/content/routes';
import { SITE_URL, absoluteUrl } from '@/lib/site-url';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const titleLine = `${baseTokens.brand.name} — ${baseTokens.brand.tagline.replace(/\.$/, '')}`;
const description =
  'Research, plan, apply, and track your international education, all in one place. Apply with confidence and turn your goals into offers.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: titleLine,
    template: `%s · ${baseTokens.brand.name}`,
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: titleLine,
    description,
    type: 'website',
    url: '/',
    siteName: baseTokens.brand.name,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: titleLine,
    description,
    site: '@rakuxon',
    creator: '@rakuxon',
  },
  robots: { index: true, follow: true },
};

/** Organization + WebSite, so every page carries who publishes it and enables a sitelinks search box. */
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: baseTokens.brand.name,
  url: SITE_URL,
  logo: absoluteUrl('/logo-light.png'),
  description,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONES[0],
  sameAs: SOCIALS.filter((social) => social.label !== 'WhatsApp').map((social) => social.href),
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: baseTokens.brand.name,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}${ROUTES.explore}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
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
        {/* Organization + WebSite, present on every page: who publishes this
            site, and — via SearchAction — the sitelinks search box Google may
            show under the brand's own result. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      <body>
        {/* No tenant overrides on the public site — always the base theme. */}
        <ThemeProvider tokens={{ brand: BRAND_LOGO }}>
          <SessionProvider>
            <SiteChrome>{children}</SiteChrome>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
