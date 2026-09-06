import type { Metadata } from 'next';

import { PRIVACY } from '@/content/legal';
import { LegalPage } from '@/sections/LegalPage';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What the Rakuxon privacy policy will cover. Not yet a published policy.',
  robots: { index: false },
};

export default function PrivacyPage() {
  return <LegalPage content={PRIVACY} titleId="privacy-heading" />;
}
