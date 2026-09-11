import type { Metadata } from 'next';

import { ROUTES } from '@/content/routes';
import { TERMS } from '@/content/legal';
import { LegalPage } from '@/sections/LegalPage';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'What the Rakuxon terms of service will cover. Not yet published terms.',
  alternates: { canonical: ROUTES.terms },
  robots: { index: false },
};

export default function TermsPage() {
  return <LegalPage content={TERMS} titleId="terms-heading" />;
}
