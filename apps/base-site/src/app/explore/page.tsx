import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CtaBand, PageHeader, SectionBand, StatChip } from '@rakuxon/ui';
import { Building2 } from 'lucide-react';

import { fetchArticles, fetchCourses } from '@/lib/catalogue/edvoy';
import {
  COVERED_COUNTRIES,
  fetchCountryCounts,
  fetchInstitutions,
} from '@/lib/catalogue/institutions';
import { SIGN_UP } from '@/content/routes';

import { ExploreControls } from './ExploreControls';
import type { TabKey } from './ExploreControls';
import { ArticleResults, CourseResults, InstitutionResults } from './ResultList';

export const metadata: Metadata = {
  title: 'Explore courses and universities',
  description:
    'Search courses, universities and guidance articles across the UK, Canada, the US, Ireland, Australia and Germany.',
};

/** Revalidated rather than static: the catalogue behind it moves. */
export const revalidate = 3600;

type Search = Promise<Record<string, string | string[] | undefined>>;

const asString = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

async function Results({ tab, country, query }: { tab: TabKey; country: string; query: string }) {
  if (tab === 'universities') {
    return (
      <InstitutionResults
        result={await fetchInstitutions({ countryCode: country, search: query })}
      />
    );
  }

  const countryName = COVERED_COUNTRIES.find((entry) => entry.code === country)?.name;
  if (tab === 'articles') return <ArticleResults result={await fetchArticles(countryName)} />;
  return <CourseResults result={await fetchCourses(countryName)} />;
}

async function CountryCounts() {
  const counts = await fetchCountryCounts();
  if (counts.error || counts.items.length === 0) return null;

  return (
    <SectionBand tone="muted" labelledBy="explore-counts-heading">
      <h2
        id="explore-counts-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Institutions by destination
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Registered education organisations per country, from the open Research Organization
        Registry.
      </p>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {counts.items.map((entry, index) => (
          <li key={entry.countryCode}>
            <StatChip
              icon={Building2}
              tone={(['tone1', 'tone2', 'tone3', 'tone4'] as const)[index % 4]}
              value={entry.institutions.toLocaleString('en-GB')}
              label={entry.country}
              animate
            />
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}

export default async function ExplorePage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const requested = asString(params.tab);
  const tab: TabKey =
    requested === 'universities' || requested === 'articles' ? requested : 'courses';
  const country = asString(params.country);
  const query = asString(params.q);

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Find the course, the university, or the answer"
        titleId="explore-heading"
        subcopy="Search across programmes, institutions and guidance. No account needed."
      />

      <SectionBand labelledBy="explore-results-heading">
        <h2 id="explore-results-heading" className="sr-only">
          Search results
        </h2>

        <Suspense fallback={null}>
          <ExploreControls tab={tab} country={country} query={query} />
        </Suspense>

        <div className="mt-10">
          <Suspense
            key={`${tab}-${country}-${query}`}
            fallback={
              <p className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted">
                Searching…
              </p>
            }
          >
            <Results tab={tab} country={country} query={query} />
          </Suspense>
        </div>
      </SectionBand>

      <Suspense fallback={null}>
        <CountryCounts />
      </Suspense>

      <SectionBand tone="surface" labelledBy="explore-cta-heading">
        <CtaBand
          headingId="explore-cta-heading"
          heading="Found something that fits?"
          subline="Build a profile and we will match you against the full catalogue."
          cta={{ label: 'Get matched', href: SIGN_UP }}
          reassurance="Free, and you can stop at any point."
        />
      </SectionBand>
    </>
  );
}
