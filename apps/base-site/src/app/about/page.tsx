import type { Metadata } from 'next';

import { CtaBand, ImageHero, MediaSection, SectionBand, StatChip, ValueProps } from '@rakuxon/ui';
import { Building2, GraduationCap, Globe2, Users } from 'lucide-react';

import {
  ABOUT_CAREERS,
  ABOUT_CTA,
  ABOUT_HERO,
  ABOUT_MODEL,
  ABOUT_STATS,
  ABOUT_STORY,
  ABOUT_VISION_MISSION,
  ABOUT_VALUES,
} from '@/content/about';
import { ROUTES } from '@/content/routes';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why we built Rakuxon: the information that decides an application is not secret, just scattered.',
  alternates: { canonical: ROUTES.about },
};

const STAT_ICONS = [Users, Building2, GraduationCap, Globe2];

export default function AboutPage() {
  return (
    <>
      <ImageHero
        eyebrow={ABOUT_HERO.eyebrow}
        title={ABOUT_HERO.title}
        titleId="about-heading"
        subcopy={ABOUT_HERO.subcopy}
        image={ABOUT_HERO.image}
        tone="muted"
      />

      <MediaSection
        heading={ABOUT_STORY.heading}
        headingId="about-story-heading"
        body={ABOUT_STORY.body}
        points={ABOUT_STORY.points}
        image={ABOUT_STORY.image}
        imageSide="left"
      />

      <SectionBand labelledBy="about-vision-heading">
        <h2
          id="about-vision-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          {ABOUT_VISION_MISSION.heading}
        </h2>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {ABOUT_VISION_MISSION.items.map((item) => (
            <li key={item.title} className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-accent-soft text-primary">
                  <item.icon size={20} aria-hidden="true" focusable="false" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-text">{item.title}</h3>
                {/* Quoted, because these are Rakuxon's own formal words. */}
                <blockquote className="mt-3 text-base text-text-muted">
                  <p>“{item.body}”</p>
                </blockquote>
              </div>
            </li>
          ))}
        </ul>
      </SectionBand>

      <SectionBand tone="muted" id="how-we-work" labelledBy="about-model-heading">
        <h2
          id="about-model-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          How we work: three sides, one record
        </h2>
        <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
          Students, agencies and institutions each get their own view of the same application. No
          one is retyping what someone else already knows.
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {ABOUT_MODEL.map((surface) => (
            <li
              key={surface.title}
              className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm"
            >
              <h3 className="font-heading text-lg font-semibold text-text">{surface.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{surface.description}</p>
              <a
                href={surface.href}
                className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-primary transition-colors duration-fast ease-standard hover:text-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Read more
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </SectionBand>

      <SectionBand labelledBy="about-values-heading">
        <h2
          id="about-values-heading"
          className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
        >
          What we hold ourselves to
        </h2>
        <ValueProps className="mt-12" items={ABOUT_VALUES} columns={3} />
      </SectionBand>

      <SectionBand tone="muted" labelledBy="about-stats-heading">
        <h2 id="about-stats-heading" className="sr-only">
          Rakuxon by the numbers
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_STATS.map((stat, index) => (
            <li key={stat.label}>
              <StatChip
                icon={STAT_ICONS[index] ?? Users}
                tone={(['tone1', 'tone2', 'tone3', 'tone4'] as const)[index] ?? 'tone1'}
                value={stat.value}
                label={stat.label}
                sample
                animate
              />
            </li>
          ))}
        </ul>
      </SectionBand>

      <SectionBand id="careers" labelledBy="about-careers-heading">
        <div className="mx-auto max-w-prose text-center">
          <h2
            id="about-careers-heading"
            className="font-heading text-2xl font-bold text-text md:text-3xl"
          >
            {ABOUT_CAREERS.heading}
          </h2>
          <p className="mt-4 text-base text-text-muted">{ABOUT_CAREERS.body}</p>
          <a
            href={ABOUT_CAREERS.cta.href}
            className="mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-border px-6 py-4 text-base font-semibold text-primary transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            {ABOUT_CAREERS.cta.label}
          </a>
        </div>
      </SectionBand>

      <SectionBand tone="surface" labelledBy="about-cta-heading">
        <CtaBand
          headingId="about-cta-heading"
          heading={ABOUT_CTA.heading}
          subline={ABOUT_CTA.subline}
          cta={ABOUT_CTA.cta}
          reassurance={ABOUT_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
