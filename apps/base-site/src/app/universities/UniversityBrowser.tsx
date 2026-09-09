import { InstitutionCard, SignUpPrompt } from '@rakuxon/ui';

import { ROUTES, applyHref, universityRoute } from '@/content/routes';
import type { ApiCountry, ApiInstitution } from '@/lib/catalogue/api';
import type { CatalogueResult } from '@/lib/catalogue/types';

interface Props {
  countries: readonly ApiCountry[];
  result: CatalogueResult<ApiInstitution> & { page: number; pageCount: number };
  country: string;
  query: string;
}

/**
 * The browse grid and its filters.
 *
 * A server component reading real data, where it used to filter a short
 * hard-coded list in the browser. Filter state lives in the URL rather than in
 * React state, which makes a filtered view shareable, linkable and indexable —
 * none of which a useState filter can be.
 *
 * The form works without JavaScript: it is a GET form pointing at this page.
 */
export function UniversityBrowser({ countries, result, country, query }: Props) {
  const { items, total, page, pageCount, error } = result;

  const hrefFor = (next: { country?: string; q?: string; page?: number }) => {
    const params = new URLSearchParams();
    const chosenCountry = next.country ?? country;
    const chosenQuery = next.q ?? query;

    if (chosenCountry) params.set('country', chosenCountry);
    if (chosenQuery) params.set('q', chosenQuery);
    if (next.page && next.page > 1) params.set('page', String(next.page));

    const search = params.toString();
    return search ? `${ROUTES.universities}?${search}` : ROUTES.universities;
  };

  return (
    <div className="flex flex-col gap-8">
      <form method="get" action={ROUTES.universities} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="flex flex-col gap-2">
            <label htmlFor="university-q" className="text-sm font-medium text-text">
              Search universities
            </label>
            <input
              id="university-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Name, acronym or city"
              className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="university-country" className="text-sm font-medium text-text">
              Destination
            </label>
            <select
              id="university-country"
              name="country"
              defaultValue={country}
              className="min-h-12 rounded-md border border-border bg-surface px-4 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              <option value="">All destinations</option>
              {countries.map((entry) => (
                <option key={entry.countryCode} value={entry.countryCode}>
                  {entry.country} ({entry.institutions})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="min-h-12 self-end rounded-md bg-primary px-6 text-base font-semibold text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Search
          </button>
        </div>
      </form>

      {error ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted"
        >
          <span className="block font-semibold text-text">
            Universities are unavailable right now.
          </span>
          <span className="mt-2 block text-sm">{error}</span>
        </p>
      ) : items.length === 0 ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted"
        >
          <span className="block font-semibold text-text">No universities match that search.</span>
          <span className="mt-2 block text-sm">
            Try a broader term, or{' '}
            <a href={ROUTES.universities} className="rounded-sm text-primary underline">
              clear the filters
            </a>
            .
          </span>
        </p>
      ) : (
        <>
          <p className="text-sm text-text-muted" role="status">
            {total.toLocaleString('en-GB')} universit{total === 1 ? 'y' : 'ies'}
            {country ? ' in this destination' : ''}
            {query ? ` matching “${query}”` : ''}.
          </p>

          <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((institution) => (
              <li key={institution.id} className="h-full">
                <InstitutionCard
                  name={institution.name}
                  location={[institution.city, institution.country].filter(Boolean).join(', ')}
                  countryCode={institution.countryCode}
                  href={universityRoute(institution.slug)}
                  applyHref={applyHref({ university: institution.slug })}
                  badge={institution.fastTrackOffer ? 'Fast-track offer' : undefined}
                  facts={[
                    {
                      label: 'Courses listed',
                      value: institution.courseCount
                        ? String(institution.courseCount)
                        : 'Ask an advisor',
                    },
                    { label: 'Destination', value: institution.country },
                  ]}
                />
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
              {/* Real links, not buttons: a page of results should be
                  shareable, and the browser's back button should work. */}
              {page > 1 ? (
                <a
                  href={hrefFor({ page: page - 1 })}
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  ← Previous
                </a>
              ) : (
                <span />
              )}

              <p className="text-sm text-text-muted">
                Page {page} of {pageCount}
              </p>

              {page < pageCount ? (
                <a
                  href={hrefFor({ page: page + 1 })}
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  Next →
                </a>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}

      <SignUpPrompt
        heading="Not sure which of these fits?"
        body="Create a free account and we will match you against the catalogue on your grades, budget and destination — or talk it through with an advisor first."
        ctaLabel="Get matched"
        ctaHref={applyHref({})}
        secondaryLabel="Book a free consultation"
        secondaryHref={ROUTES.contact}
        reassurance="Free to join. The first consultation costs nothing."
      />
    </div>
  );
}
