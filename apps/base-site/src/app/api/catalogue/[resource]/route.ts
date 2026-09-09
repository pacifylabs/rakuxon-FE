import { NextResponse } from 'next/server';

import { findCourses } from '@/lib/catalogue/bank';
import { fetchCountries, fetchInstitutions, searchCatalogue } from '@/lib/catalogue/api';

/**
 * The catalogue as real HTTP endpoints.
 *
 * The pages fetch server-side, so those calls never appear in a browser's
 * network panel. These routes make the same data inspectable and callable —
 * useful for debugging, and required by any client-side search that wants
 * results without a full navigation.
 *
 *   GET /api/catalogue/universities?country=GB&q=oxford
 *   GET /api/catalogue/courses?country=GB&level=postgraduate&discipline=business
 *   GET /api/catalogue/suggest?q=nor&limit=8
 *   GET /api/catalogue/country-counts
 *
 * Universities and suggestions come from our own backend, so an admin can
 * unpublish a record and it disappears everywhere without a redeploy. Courses
 * are still the local seed until the course importer lands.
 *
 * These stay server-side proxies rather than letting the browser call the API
 * directly: it keeps the backend origin out of the client bundle, and means a
 * CORS rule is not load-bearing for the search box working.
 */

/* Matches the windows in api.ts. An hour meant a publish took an hour to
   show, which is not a toggle. */
export const revalidate = 300;

const RESOURCES = ['universities', 'courses', 'suggest', 'country-counts'] as const;
type Resource = (typeof RESOURCES)[number];

const isResource = (value: string): value is Resource =>
  (RESOURCES as readonly string[]).includes(value);


export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;

  if (!isResource(resource)) {
    return NextResponse.json(
      { error: `Unknown resource. Try one of: ${RESOURCES.join(', ')}.` },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const country = url.searchParams.get('country') ?? '';
  const query = url.searchParams.get('q') ?? '';

  const result = await (async () => {
    switch (resource) {
      case 'universities':
        return fetchInstitutions({ country, q: query, limit: 24 });
      case 'courses':
        return findCourses({
          q: query,
          countryCode: country,
          level: url.searchParams.get('level') ?? '',
          discipline: url.searchParams.get('discipline') ?? '',
        });
      case 'suggest':
        return searchCatalogue(query, Number(url.searchParams.get('limit') ?? 8));
      case 'country-counts':
        return { items: await fetchCountries() };
    }
  })();

  // A provider failure is reported in the body, not as a 5xx: the caller gets
  // a usable shape either way and can render the reason.
  return NextResponse.json(result, {
    headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
