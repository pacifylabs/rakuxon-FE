import { emptyResult } from './types';
import type { CatalogueResult } from './types';

/**
 * The catalogue, from our own API.
 *
 * Replaces the local sample bank for institutions: the backend now holds
 * several thousand of them, imported from ROR, and a copy in the frontend
 * would go stale the moment anyone publishes or suspends a record.
 *
 * Every call fails soft. A marketing page has to render when the API is slow
 * or down — an empty grid with a message beats a 500, and a country menu that
 * fails should not take the header with it.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/** Long enough for a cold serverless database, short enough not to hang a page. */
const TIMEOUT_MS = 8_000;

export interface ApiInstitution {
  id: string;
  slug: string;
  name: string;
  aka: string[];
  country: string;
  countryCode: string;
  city?: string;
  website?: string;
  logoUrl?: string;
  fastTrackOffer: boolean;
  courseCount: number;
}

export interface ApiCountry {
  countryCode: string;
  country: string;
  institutions: number;
}

interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

/**
 * Failures are swallowed so a page still renders, which makes them invisible.
 * They are logged first — a silently empty catalogue is far harder to diagnose
 * than a noisy one, and this cost an hour proving the endpoint was fine.
 */
function reportFailure(path: string, error: unknown): void {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`[catalogue] ${path} failed: ${reason}`);
}

async function getJson<T>(path: string, revalidate: number): Promise<T> {
  /*
   * An explicit timeout, because fetch has none by default: a hung upstream
   * would otherwise hold the request until the platform kills it, turning a
   * slow dependency into a dead page.
   */
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/v1/catalogue${path}`, {
      signal: abort.signal,
      next: { revalidate },
      headers: { accept: 'application/json' },
    });

    if (!response.ok) throw new Error(`Catalogue responded ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Destinations for the country menu, with the count behind each one. */
export async function fetchCountries(): Promise<ApiCountry[]> {
  try {
    /*
     * Five minutes, not an hour.
     *
     * An hour cached an empty menu from before the first records were
     * published, and kept serving it long after — which made the claim that an
     * admin can publish and see it everywhere plainly false. Publish latency is
     * a product decision, and five minutes is the longest that still feels
     * like the toggle did something.
     */
    return await getJson<ApiCountry[]>('/countries', 300);
  } catch (error) {
    reportFailure('/countries', error);
    /* The header must still render. An empty menu is a degraded page; a thrown
       error is no page at all. */
    return [];
  }
}

export interface BrowseOptions {
  country?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchInstitutions(
  options: BrowseOptions = {},
): Promise<CatalogueResult<ApiInstitution> & { page: number; pageCount: number }> {
  const params = new URLSearchParams();
  if (options.country) params.set('country', options.country);
  if (options.q?.trim()) params.set('q', options.q.trim());
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  try {
    const paged = await getJson<Paged<ApiInstitution>>(
      `/institutions?${params.toString()}`,
      300,
    );

    return {
      items: paged.items,
      total: paged.total,
      page: paged.page,
      pageCount: paged.pageCount,
      source: 'bank',
    };
  } catch (error) {
    reportFailure('/institutions', error);
    return {
      ...emptyResult<ApiInstitution>(
        'unavailable',
        error instanceof Error && error.name === 'AbortError'
          ? 'The catalogue took too long to answer.'
          : 'The catalogue is unavailable right now.',
      ),
      page: 1,
      pageCount: 1,
    };
  }
}

/** One university. Null rather than throwing, so a page can render notFound(). */
export async function fetchInstitution(slug: string): Promise<ApiInstitution | null> {
  try {
    return await getJson<ApiInstitution>(`/institutions/${encodeURIComponent(slug)}`, 300);
  } catch (error) {
    reportFailure(`/institutions/${slug}`, error);
    return null;
  }
}

export interface ApiSuggestion {
  type: 'institution' | 'course' | 'article';
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  countryCode?: string;
  highlight: { text: string; match: boolean }[];
}

/**
 * The ranked typeahead, across universities, courses and guidance.
 *
 * Ranking happens in the database, not here: comparing candidates only means
 * something when they are compared against each other, and the backend already
 * does that in one query.
 */
export async function searchCatalogue(
  query: string,
  limit = 8,
): Promise<{ items: ApiSuggestion[]; total: number }> {
  const params = new URLSearchParams({ query, limit: String(limit) });

  try {
    return await getJson<{ items: ApiSuggestion[]; total: number }>(
      `/search?${params.toString()}`,
      60,
    );
  } catch (error) {
    reportFailure('/search', error);
    /* A search box that errors is worse than one that finds nothing: the
       visitor cannot tell the difference between "no match" and "broken", but
       an empty dropdown at least lets them keep typing. */
    return { items: [], total: 0 };
  }
}
