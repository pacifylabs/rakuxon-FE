import type { Metadata } from 'next';

import { CtaBand, ImageHero, MediaSection, SectionBand, StepItem, ValueProps } from '@rakuxon/ui';

import {
  INSTITUTIONS_CTA,
  INSTITUTIONS_HERO,
  INSTITUTION_STEPS,
  INSTITUTION_TRUST,
  INSTITUTION_VALUE_PROPS,
} from '@/content/institutions';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'For institutions',
  description:
    'Receive complete, checked applications from a vetted partner network, and diversify enrolment without opening an office in every market.',
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
      />

      <SectionBand tone="muted" labelledBy="institutions-value-heading">
        <h2
          id="institutions-value-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          How we help institutions
        </h2>
        <ValueProps className="mt-12" items={INSTITUTION_VALUE_PROPS} columns={4} />
      </SectionBand>

      <MediaSection
        eyebrow={INSTITUTION_TRUST.eyebrow}
        heading={INSTITUTION_TRUST.heading}
        headingId="institutions-trust-heading"
        body={INSTITUTION_TRUST.body}
        points={INSTITUTION_TRUST.points}
        image={INSTITUTION_TRUST.image}
        imageSide="left"
      />

      <SectionBand tone="muted" labelledBy="institutions-steps-heading">
        <h2
          id="institutions-steps-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Getting started takes three steps
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {INSTITUTION_STEPS.map((step, index) => (
            <StepItem
              key={step.title}
              step={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </ol>
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
