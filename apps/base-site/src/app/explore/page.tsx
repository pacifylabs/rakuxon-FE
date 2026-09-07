import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CtaBand, PageHeader, SectionBand, SignUpPrompt, StatChip } from '@rakuxon/ui';
import { Building2 } from 'lucide-react';

import { findCourses, listInstitutions } from '@/lib/catalogue/bank';
import { fetchCountryCounts } from '@/lib/catalogue/institutions';
import { ROUTES, SIGN_UP } from '@/content/routes';

import { ExploreControls } from './ExploreControls';
import type { TabKey } from './ExploreControls';
import { CourseResults, InstitutionResults } from './ResultList';

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
    /*
     * Our own catalogue, not the open registry.
     *
     * The registry lists every education organisation on earth, which looked
     * generous and behaved badly: most cards had no page to open and no course
     * to apply to, so the only action left was a link off to the university's
     * own site. A listing where half the cards are dead ends is worse than a
     * shorter one where every card works. The registry still powers the
     * per-country counts below, which is a real signal.
     */
    return <InstitutionResults result={listInstitutions()} />;
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
        body="Course guides and country guidance are being written with our counsellors. Create an account and we will send them as they land — along with the deadlines that matter for the courses you save."
        ctaLabel="Create a free account"
        ctaHref={SIGN_UP}
        secondaryLabel="Book a free consultation"
        secondaryHref={ROUTES.contact}
        reassurance="Free to join. The first consultation costs nothing."
      />
    );
  }

  return <CourseResults result={findCourses({ q: query, countryCode: country })} />;
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
