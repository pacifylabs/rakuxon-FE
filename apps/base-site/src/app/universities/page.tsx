import type { Metadata } from 'next';

import { CtaBand, PageHeader, SectionBand } from '@rakuxon/ui';

import { UNIVERSITIES_CTA, UNIVERSITIES_HEADER } from '@/content/universities';

import { UniversityBrowser } from './UniversityBrowser';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Explore universities',
  description: 'Browse universities by country, level and subject. No account needed, no pressure.',
};

export default function UniversitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow={UNIVERSITIES_HEADER.eyebrow}
        title={UNIVERSITIES_HEADER.title}
        titleId="universities-heading"
        subcopy={UNIVERSITIES_HEADER.subcopy}
      />

      <SectionBand labelledBy="universities-browse-heading">
        <h2 id="universities-browse-heading" className="sr-only">
          Browse universities
        </h2>
        <UniversityBrowser />
      </SectionBand>

      <SectionBand tone="surface" labelledBy="universities-cta-heading">
        <CtaBand
          headingId="universities-cta-heading"
          heading={UNIVERSITIES_CTA.heading}
          subline={UNIVERSITIES_CTA.subline}
          cta={UNIVERSITIES_CTA.cta}
          reassurance={UNIVERSITIES_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
