import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider, baseTokens } from '@rakuxon/ui';

import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Rakuxon admin', template: `%s · ${baseTokens.brand.name}` },
  description: 'Vet tenants and institutions, manage the catalogue, configure plans.',
  /* An authenticated workspace has nothing to offer a crawler. */
  robots: { index: false, follow: false },
};

/**
 * The real Rakuxon artwork, the same asset base-site ships — see that app's
 * `content/site.ts` for why two files (light/dark ink) rather than one.
 * Without this, ThemeProvider has no `brand.logo` and Wordmark falls back to
 * the drawn placeholder mark, which is what this app was shipping before.
 */
const BRAND_LOGO = {
  logo: '/logo-light.png',
  logoDark: '/logo-dark.png',
  logoWidth: '1200',
  logoHeight: '400',
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider tokens={{ brand: BRAND_LOGO }}>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
