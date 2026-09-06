import type { Metadata } from 'next';

import { CtaBand, FactGrid, ImageHero, MediaSection, SectionBand, ValueProps } from '@rakuxon/ui';

import {
  AGENCIES_CTA,
  AGENCIES_HERO,
  AGENCY_BENEFITS,
  AGENCY_VALUE_PROPS,
  AGENCY_WORKFLOW,
} from '@/content/agencies';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'For agencies',
  description:
    'Run your whole student pipeline on one board, onboard students with a single link, and keep your commission. No platform fees.',
};

export default function AgenciesPage() {
  return (
    <>
      <ImageHero
        eyebrow={AGENCIES_HERO.eyebrow}
        title={AGENCIES_HERO.title}
        titleId="agencies-heading"
        subcopy={AGENCIES_HERO.subcopy}
        primaryCta={AGENCIES_HERO.primaryCta}
        secondaryCta={AGENCIES_HERO.secondaryCta}
        image={AGENCIES_HERO.image}
        imageSide="left"
        tone="muted"
      />

      <SectionBand labelledBy="agencies-value-heading">
        <h2
          id="agencies-value-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          How we help you place more students
        </h2>
        <ValueProps className="mt-12" items={AGENCY_VALUE_PROPS} columns={3} />
      </SectionBand>

      <MediaSection
        eyebrow={AGENCY_WORKFLOW.eyebrow}
        heading={AGENCY_WORKFLOW.heading}
        headingId="partner-workflow"
        body={AGENCY_WORKFLOW.body}
        points={AGENCY_WORKFLOW.points}
        cta={AGENCY_WORKFLOW.cta}
        image={AGENCY_WORKFLOW.image}
        tone="muted"
      />

      <SectionBand labelledBy="agencies-benefits-heading">
        <h2
          id="agencies-benefits-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          What partnering costs you
        </h2>
        <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
          Nothing, while we build the network. Here is the arrangement in full.
        </p>
        <FactGrid className="mt-12" facts={AGENCY_BENEFITS} columns={3} sample />
      </SectionBand>

      <SectionBand tone="surface" labelledBy="agencies-cta-heading">
        <CtaBand
          headingId="agencies-cta-heading"
          heading={AGENCIES_CTA.heading}
          subline={AGENCIES_CTA.subline}
          cta={AGENCIES_CTA.cta}
          reassurance={AGENCIES_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
