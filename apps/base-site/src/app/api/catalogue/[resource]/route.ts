import { NextResponse } from 'next/server';

import { findCourses, suggest } from '@/lib/catalogue/bank';
import { fetchCountryCounts, fetchInstitutions } from '@/lib/catalogue/institutions';

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
 * Courses and suggestions come from our own bank rather than a third party, so
 * nothing here depends on somebody else's uptime or deploy schedule, and an
 * admin can unpublish a record without asking anyone.
 */

export const revalidate = 3600;

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
        return fetchInstitutions({ countryCode: country, search: query });
      case 'courses':
        return findCourses({
          q: query,
          countryCode: country,
          level: url.searchParams.get('level') ?? '',
          discipline: url.searchParams.get('discipline') ?? '',
        });
      case 'suggest':
        return suggest(query, Number(url.searchParams.get('limit') ?? 8));
      case 'country-counts':
        return fetchCountryCounts();
    }
  })();

  // A provider failure is reported in the body, not as a 5xx: the caller gets
  // a usable shape either way and can render the reason.
  return NextResponse.json(result, {
    headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
