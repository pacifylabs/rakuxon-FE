import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider, baseTokens } from '@rakuxon/ui';

import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Rakuxon for institutions', template: `%s · ${baseTokens.brand.name}` },
  description: 'Triage applications, request information and issue offers.',
  /* An authenticated workspace has nothing to offer a crawler. */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
