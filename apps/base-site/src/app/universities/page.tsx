import type { Metadata } from 'next';

import { CtaBand, PageHeader, SectionBand } from '@rakuxon/ui';

import { UNIVERSITIES_CTA, UNIVERSITIES_HEADER } from '@/content/universities';
import { fetchCountries, fetchInstitutions } from '@/lib/catalogue/api';

import { UniversityBrowser } from './UniversityBrowser';

/* Revalidated, not static: the catalogue behind this page changes when an
   admin publishes or suspends a record. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Explore universities',
  description: 'Browse universities by country, level and subject. No account needed, no pressure.',
};

type Search = Promise<Record<string, string | string[] | undefined>>;

const asString = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

export default async function UniversitiesPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const country = asString(params.country).toUpperCase();
  const q = asString(params.q);
  const page = Number(asString(params.page)) || 1;

  /* Both in parallel: the menu does not depend on the results, and awaiting
     them in sequence would add a whole round trip to every page view. */
  const [countries, result] = await Promise.all([
    fetchCountries(),
    fetchInstitutions({ country, q, page, limit: 24 }),
  ]);

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
        <UniversityBrowser
          countries={countries}
          result={result}
          country={country}
          query={q}
        />
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
