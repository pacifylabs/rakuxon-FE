import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider, baseTokens, themeScript } from '@rakuxon/ui';

import { SessionProvider } from '@/components/SessionProvider';
import { SiteChrome } from '@/components/SiteChrome';

import { BRAND_LOGO } from '@/content/site';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const description =
  'Research, plan, apply, and track your international education, all in one place. Apply with confidence and turn your goals into offers.';

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
        <ThemeProvider tokens={{ brand: BRAND_LOGO }}>
          <SessionProvider>
            <SiteChrome>{children}</SiteChrome>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
