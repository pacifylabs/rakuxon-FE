import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CtaBand, PageHeader, SectionBand, SignUpPrompt, StatChip } from '@rakuxon/ui';

import { fetchCountries, fetchCourses, fetchInstitutions } from '@/lib/catalogue/api';
import { ROUTES, SIGN_UP } from '@/content/routes';

import { ExploreControls } from './ExploreControls';
import type { TabKey } from './ExploreControls';
import { CourseResults, InstitutionResults } from './ResultList';

export const metadata: Metadata = {
  title: 'Explore courses and universities',
  description:
    'Search courses, universities and guidance articles across the UK, Canada, the US, Ireland, Australia and Germany.',
  alternates: { canonical: ROUTES.explore },
};

/** Revalidated rather than static: the catalogue behind it moves. */
export const revalidate = 3600;

type Search = Promise<Record<string, string | string[] | undefined>>;

const asString = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

async function Results({ tab, country, query }: { tab: TabKey; country: string; query: string }) {
  if (tab === 'universities') {
    /*
     * Our own catalogue, fetched from the backend — the same source
     * /universities reads. This used to read a local illustrative sample
     * (`bank.ts`), left over from before the backend held anything; now that
     * it holds several thousand imported institutions, there is no reason
     * for this tab to show different results from the dedicated page.
     */
    const result = await fetchInstitutions({ country, q: query, limit: 24 });
    return <InstitutionResults result={result} />;
  }

  /*
   * Guidance articles had no source once the competitor proxy was withdrawn,
   * and an empty tab that says a build variable is unset helps nobody. The tab
   * now offers the thing an account actually provides.
   */
  if (tab === 'articles') {
    return (
      <SignUpPrompt
        heading="Guidance, written for your application"
        body="Course guides and country guidance are being written with our counsellors. Create an account and we will send them as they land, along with the deadlines that matter for the courses you save."
        ctaLabel="Create a free account"
        ctaHref={SIGN_UP}
        secondaryLabel="Book a free consultation"
        secondaryHref={ROUTES.contact}
        reassurance="Free to join. The first consultation costs nothing."
      />
    );
  }

  /*
   * Our own catalogue, same as the universities tab above. There is
   * currently no licensed source of real course-level data (fees, intakes,
   * entry requirements) — only institutions, from ROR — so this is honestly
   * near-empty rather than backed by illustrative content invented under a
   * real university's name.
   */
  const result = await fetchCourses({ country, q: query, limit: 24 });
  return <CourseResults result={result} />;
}

async function CountryCounts() {
  const counts = await fetchCountries();
  if (counts.length === 0) return null;

  return (
    <SectionBand tone="muted" labelledBy="explore-counts-heading">
      <h2
        id="explore-counts-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Institutions by destination
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Published universities per country, counted live from our own catalogue.
      </p>

      <ul className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-3">
        {counts.map((entry) => (
          <li key={entry.countryCode}>
            <StatChip
              countryCode={entry.countryCode}
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

  /* Destinations the catalogue actually has published universities in —
     replaces a hand-written six-country list that could say "Germany" long
     after every German institution had been unpublished, or stay silent
     about a seventh once one is. */
  const countries = await fetchCountries();

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
          <ExploreControls tab={tab} country={country} query={query} countries={countries} />
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
