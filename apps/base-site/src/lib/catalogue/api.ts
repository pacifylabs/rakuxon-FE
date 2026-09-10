import { emptyResult } from './types';
import type { CatalogueResult, Intake, StudyLevel, StudyMode } from './types';

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

const BASE_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/**
 * Long enough to survive a sleeping API, short enough not to hang a page.
 *
 * The API is on Render's free tier, which stops the instance after fifteen
 * minutes of quiet and takes tens of seconds to bring it back. Warm, these
 * endpoints answer in about a second; cold, the first request is the one that
 * does the waking. An eight-second abort meant the first visitor after a quiet
 * spell reliably saw "the catalogue took too long to answer" — which is how
 * /universities came to look broken while the API was in fact fine.
 *
 * So: a short first attempt, then a longer one. The first request wakes the
 * instance even when it times out, so the retry usually lands on a live server
 * rather than repeating the same wait.
 */
const TIMEOUT_MS = 6_000;
const RETRY_TIMEOUT_MS = 25_000;

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

/**
 * The full record from /institutions/:slug.
 *
 * Separate from the summary the listing returns: the detail endpoint carries
 * the fields a page needs and a card does not, and typing them as one shape
 * would let a card silently depend on data the listing never sends.
 *
 * Most of the optional fields are empty for imported records — the registry
 * has names, locations and acronyms, not fee tables — so every consumer has to
 * treat them as absent rather than assume.
 */
export interface ApiInstitutionDetail extends ApiInstitution {
  about?: string | null;
  highlights?: string[];
  campuses?: { name: string; city: string; countryCode: string }[];
  requiredDocuments?: {
    id: string;
    label: string;
    items: { name: string; minPercentage?: number; note?: string }[];
  }[];
  englishTests?: { test: string; minScore: string }[];
  faqs?: { question: string; answer: string }[];
  qualityRatings?: { scheme: string; level: string; year: number }[];
  employability?: string | null;
  /** From Wikidata. Absent for institutions it does not cover. */
  foundedYear?: number | null;
  studentCount?: number | null;
  /** Wikipedia intro. CC BY-SA, so it is unusable without the source URL. */
  overview?: string | null;
  overviewSourceUrl?: string | null;
  heroImageUrl?: string | null;
  motto?: string | null;
  memberships?: string[];
  latitude?: string | null;
  longitude?: string | null;
  tuitionFrom?: string | null;
  tuitionCurrency?: string | null;
  upcomingIntake?: string | null;
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

async function attempt<T>(path: string, revalidate: number, timeoutMs: number): Promise<T> {
  /*
   * An explicit timeout, because fetch has none by default: a hung upstream
   * would otherwise hold the request until the platform kills it, turning a
   * slow dependency into a dead page.
   */
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

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

/** Retried once, because the first attempt is often what wakes the instance. */
async function getJson<T>(path: string, revalidate: number): Promise<T> {
  try {
    return await attempt<T>(path, revalidate, TIMEOUT_MS);
  } catch (error) {
    /* A 404 is an answer, not a failure to answer. Retrying it wastes the
       visitor's time and still ends in the same 404. */
    if (error instanceof Error && /responded 4\d\d/.test(error.message)) throw error;

    return attempt<T>(path, revalidate, RETRY_TIMEOUT_MS);
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
export async function fetchInstitution(slug: string): Promise<ApiInstitutionDetail | null> {
  try {
    return await getJson<ApiInstitutionDetail>(`/institutions/${encodeURIComponent(slug)}`, 300);
  } catch (error) {
    reportFailure(`/institutions/${slug}`, error);
    return null;
  }
}

export interface ApiCourse {
  id: string;
  slug: string;
  title: string;
  level: StudyLevel;
  studyMode: StudyMode;
  disciplines: string[];
  durationMonths: number;
  /** Numeric string — Postgres `numeric` comes back as text, not a float. */
  tuitionAmount?: string;
  tuitionCurrency?: string;
  fastTrackOffer: boolean;
  intakes: Intake[];
  institutionId: string;
  institutionName: string;
  institutionSlug: string;
  country: string;
  countryCode: string;
}

export interface CourseBrowseOptions {
  country?: string;
  q?: string;
  level?: string;
  discipline?: string;
  institutionSlug?: string;
  page?: number;
  limit?: number;
}

export async function fetchCourses(
  options: CourseBrowseOptions = {},
): Promise<CatalogueResult<ApiCourse> & { page: number; pageCount: number }> {
  const params = new URLSearchParams();
  if (options.country) params.set('country', options.country);
  if (options.q?.trim()) params.set('q', options.q.trim());
  if (options.level) params.set('level', options.level);
  if (options.discipline) params.set('discipline', options.discipline);
  if (options.institutionSlug) params.set('institutionSlug', options.institutionSlug);
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  try {
    const paged = await getJson<Paged<ApiCourse>>(`/courses?${params.toString()}`, 300);

    return {
      items: paged.items,
      total: paged.total,
      page: paged.page,
      pageCount: paged.pageCount,
      source: 'bank',
    };
  } catch (error) {
    reportFailure('/courses', error);
    return {
      ...emptyResult<ApiCourse>(
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

export interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  heroImageUrl?: string;
  countryCode?: string;
  tags: string[];
  readMinutes?: number;
  author?: string;
  publishedAt?: string;
}

/** The listing's own record, which carries no body — cards never show one. */
export interface ApiArticleDetail extends ApiArticle {
  body: string;
  source?: string;
  sourceUrl?: string;
}

export interface BrowseArticlesOptions {
  country?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export async function fetchArticles(
  options: BrowseArticlesOptions = {},
): Promise<{
  items: ApiArticle[];
  total: number;
  page: number;
  pageCount: number;
  tags: string[];
  error?: string;
}> {
  const params = new URLSearchParams();
  if (options.country) params.set('country', options.country);
  if (options.tag) params.set('tag', options.tag);
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  try {
    return await getJson(`/articles?${params.toString()}`, 300);
  } catch (error) {
    reportFailure('/articles', error);
    return {
      items: [],
      total: 0,
      page: 1,
      pageCount: 1,
      tags: [],
      /* The heading already says guidance is unavailable; this line says why,
         so the two together are a sentence rather than the same sentence
         twice. */
      error:
        error instanceof Error && error.name === 'AbortError'
          ? 'The catalogue took too long to answer.'
          : 'The catalogue is unavailable right now.',
    };
  }
}

/** One article. Null rather than throwing, so the page can render notFound(). */
export async function fetchArticle(slug: string): Promise<ApiArticleDetail | null> {
  try {
    return await getJson<ApiArticleDetail>(`/articles/${encodeURIComponent(slug)}`, 300);
  } catch (error) {
    reportFailure(`/articles/${slug}`, error);
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
