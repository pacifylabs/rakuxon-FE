import { CountryFlag, SignUpPrompt } from '@rakuxon/ui';

import { RESOURCES_EMPTY } from '@/content/resources';
import { ROUTES, applyHref, articleRoute } from '@/content/routes';
import type { ApiArticle, ApiCountry } from '@/lib/catalogue/api';

interface Props {
  items: readonly ApiArticle[];
  total: number;
  page: number;
  pageCount: number;
  tags: readonly string[];
  countries: readonly ApiCountry[];
  tag: string;
  country: string;
  error?: string;
}

/** "united-kingdom" -> "United kingdom". Tags are stored slugged. */
const readableTag = (tag: string) => {
  const spaced = tag.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * The guidance listing, its filters and its pager.
 *
 * Filter state lives in the URL rather than React state, for the same reason it
 * does on the university listing: a filtered view should be shareable,
 * linkable and indexable, and no amount of useState makes it any of those.
 *
 * Everything here is a link, so the page works with JavaScript disabled.
 */
export function ResourceBrowser({
  items,
  total,
  page,
  pageCount,
  tags,
  countries,
  tag,
  country,
  error,
}: Props) {
  const hrefFor = (next: { tag?: string; country?: string; page?: number }) => {
    const params = new URLSearchParams();
    const chosenTag = next.tag ?? tag;
    const chosenCountry = next.country ?? country;

    if (chosenTag) params.set('tag', chosenTag);
    if (chosenCountry) params.set('country', chosenCountry);
    if (next.page && next.page > 1) params.set('page', String(next.page));

    const search = params.toString();
    return search ? `${ROUTES.resources}?${search}` : ROUTES.resources;
  };

  /* Only destinations that actually have guidance. Offering all twenty
     countries when six have articles is twelve dead ends in a filter bar. */
  const destinations = countries.filter((entry) =>
    items.some((article) => article.countryCode === entry.countryCode),
  );

  const chipClass = (active: boolean) =>
    [
      'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none',
      active
        ? 'border-primary bg-primary text-on-primary'
        : 'border-border text-text hover:bg-surface-muted',
    ].join(' ');

  return (
    <div className="flex flex-col gap-8">
      {tags.length > 0 && (
        <nav aria-label="Filter guidance by topic" className="flex flex-wrap gap-2">
          <a href={hrefFor({ tag: '', country: '', page: 1 })} className={chipClass(!tag && !country)}>
            Everything
          </a>

          {tags.map((entry) => (
            <a
              key={entry}
              href={hrefFor({ tag: entry === tag ? '' : entry, country: '', page: 1 })}
              aria-current={entry === tag ? 'true' : undefined}
              className={chipClass(entry === tag)}
            >
              {readableTag(entry)}
            </a>
          ))}

          {destinations.map((entry) => (
            <a
              key={entry.countryCode}
              href={hrefFor({
                country: entry.countryCode === country ? '' : entry.countryCode,
                tag: '',
                page: 1,
              })}
              aria-current={entry.countryCode === country ? 'true' : undefined}
              className={chipClass(entry.countryCode === country)}
            >
              <CountryFlag countryCode={entry.countryCode} size="sm" />
              <span className="ml-2">{entry.country}</span>
            </a>
          ))}
        </nav>
      )}

      {error ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted"
        >
          <span className="block font-semibold text-text">Guidance is unavailable right now.</span>
          <span className="mt-2 block text-sm">{error}</span>
        </p>
      ) : items.length === 0 ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted"
        >
          <span className="block font-semibold text-text">{RESOURCES_EMPTY.heading}</span>
          <span className="mt-2 block text-sm">
            {RESOURCES_EMPTY.body}{' '}
            <a href={ROUTES.resources} className="rounded-sm text-primary underline">
              Show everything
            </a>
            .
          </span>
        </p>
      ) : (
        <>
          <p className="text-sm text-text-muted" role="status">
            {total} article{total === 1 ? '' : 's'}
            {tag ? ` tagged ${readableTag(tag)}` : ''}
            {country ? ' for this destination' : ''}.
          </p>

          <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <li key={article.id} className="h-full">
                <a
                  href={articleRoute(article.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    {article.countryCode && (
                      <CountryFlag countryCode={article.countryCode} size="sm" />
                    )}
                    {article.readMinutes ? `${article.readMinutes} min read` : 'Guidance'}
                  </span>

                  <h3 className="mt-3 font-heading text-lg font-semibold text-text">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="mt-2 flex-1 text-sm text-text-muted">{article.excerpt}</p>
                  )}

                  <span className="mt-4 text-sm font-semibold text-primary">Read the guide →</span>
                </a>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
              {page > 1 ? (
                <a
                  href={hrefFor({ page: page - 1 })}
                  className="inline-flex min-h-12 items-center rounded-md border border-border px-5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
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
                  className="inline-flex min-h-12 items-center rounded-md border border-border px-5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
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
        heading="Rather ask someone?"
        body="An advisor will read your grades and your budget and tell you what these articles cannot: which of it applies to you."
        ctaLabel="Book a free consultation"
        ctaHref={ROUTES.contact}
        secondaryLabel="Start an application"
        secondaryHref={applyHref({})}
        reassurance="The first conversation costs nothing."
      />
    </div>
  );
}
