import type { Metadata } from 'next';

import { CtaBand, FactGrid, ImageHero, MediaSection, SectionBand, ValueProps } from '@rakuxon/ui';

import {
  INSTITUTIONS_CTA,
  INSTITUTIONS_HERO,
  INSTITUTION_BENEFITS,
  INSTITUTION_VALUE_PROPS,
  INSTITUTION_WORKFLOW,
} from '@/content/institutions';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'For institutions',
  description:
    'Reach qualified students through a vetted agency network, and review complete applications instead of chasing missing documents. No platform fee.',
};

export default function InstitutionsPage() {
  return (
    <>
      <ImageHero
        eyebrow={INSTITUTIONS_HERO.eyebrow}
        title={INSTITUTIONS_HERO.title}
        titleId="institutions-heading"
        subcopy={INSTITUTIONS_HERO.subcopy}
        primaryCta={INSTITUTIONS_HERO.primaryCta}
        secondaryCta={INSTITUTIONS_HERO.secondaryCta}
        image={INSTITUTIONS_HERO.image}
        imageSide="left"
        tone="muted"
      />

      <SectionBand labelledBy="institutions-value-heading">
        <h2
          id="institutions-value-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          How we help you recruit with less noise
        </h2>
        <ValueProps className="mt-12" items={INSTITUTION_VALUE_PROPS} columns={3} />
      </SectionBand>

      <MediaSection
        eyebrow={INSTITUTION_WORKFLOW.eyebrow}
        heading={INSTITUTION_WORKFLOW.heading}
        headingId="institution-workflow"
        body={INSTITUTION_WORKFLOW.body}
        points={INSTITUTION_WORKFLOW.points}
        cta={INSTITUTION_WORKFLOW.cta}
        image={INSTITUTION_WORKFLOW.image}
        tone="muted"
      />

      <SectionBand labelledBy="institutions-benefits-heading">
        <h2
          id="institutions-benefits-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          What joining the network costs you
        </h2>
        <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
          Nothing, while we build the network. Here is the arrangement in full.
        </p>
        <FactGrid className="mt-12" facts={INSTITUTION_BENEFITS} columns={3} sample />
      </SectionBand>

      <SectionBand tone="surface" labelledBy="institutions-cta-heading">
        <CtaBand
          headingId="institutions-cta-heading"
          heading={INSTITUTIONS_CTA.heading}
          subline={INSTITUTIONS_CTA.subline}
          cta={INSTITUTIONS_CTA.cta}
          reassurance={INSTITUTIONS_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
