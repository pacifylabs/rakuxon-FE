import type { Metadata } from 'next';

import {
  CtaBand,
  ImageHero,
  MediaSection,
  SectionBand,
  StepItem,
  TestimonialMarquee,
  TrustBadge,
  ValueProps,
} from '@rakuxon/ui';

import {
  STUDENTS_CTA,
  STUDENTS_HERO,
  STUDENT_PREVIEW,
  STUDENT_REASSURANCE,
  STUDENT_STEPS,
  STUDENT_TESTIMONIALS,
  STUDENT_VALUE_PROPS,
} from '@/content/students';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'For students',
  description:
    'Apply to universities abroad with your documents checked, your deadlines tracked, and every decision visible in one place.',
};

export default function StudentsPage() {
  return (
    <>
      <ImageHero
        eyebrow={STUDENTS_HERO.eyebrow}
        title={STUDENTS_HERO.title}
        titleId="students-heading"
        subcopy={STUDENTS_HERO.subcopy}
        primaryCta={STUDENTS_HERO.primaryCta}
        secondaryCta={STUDENTS_HERO.secondaryCta}
        image={STUDENTS_HERO.image}
      >
        <ul className="flex flex-wrap gap-3">
          {STUDENT_REASSURANCE.map((badge) => (
            <TrustBadge key={badge.label} icon={badge.icon} label={badge.label} />
          ))}
        </ul>
      </ImageHero>

      <SectionBand tone="muted" labelledBy="students-value-heading">
        <h2
          id="students-value-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          What you actually get
        </h2>
        <ValueProps className="mt-12" items={STUDENT_VALUE_PROPS} columns={4} />
      </SectionBand>

      <MediaSection
        eyebrow={STUDENT_PREVIEW.eyebrow}
        heading={STUDENT_PREVIEW.heading}
        headingId="students-preview-heading"
        body={STUDENT_PREVIEW.body}
        points={STUDENT_PREVIEW.points}
        image={STUDENT_PREVIEW.image}
        imageSide="left"
      />

      <SectionBand tone="muted" labelledBy="students-steps-heading">
        <h2
          id="students-steps-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          From first idea to decision letter
        </h2>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {STUDENT_STEPS.map((step, index) => (
            <StepItem
              key={step.title}
              step={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </ol>
      </SectionBand>

      <SectionBand labelledBy="students-testimonials-heading">
        <h2
          id="students-testimonials-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Students who have been through it
        </h2>
        <TestimonialMarquee className="mt-12" testimonials={STUDENT_TESTIMONIALS} sample />
      </SectionBand>

      <SectionBand tone="surface" labelledBy="students-cta-heading">
        <CtaBand
          headingId="students-cta-heading"
          heading={STUDENTS_CTA.heading}
          subline={STUDENTS_CTA.subline}
          cta={STUDENTS_CTA.cta}
          reassurance={STUDENTS_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
