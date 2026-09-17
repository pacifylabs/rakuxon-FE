import type { Metadata } from 'next';

import { InstitutionDetail } from '@/components/catalogue/InstitutionDetail';
import { universityRoute } from '@/content/routes';
import { fetchInstitution } from '@/lib/catalogue/api';
import { formatLocation, summarise } from '@/lib/catalogue/format';

/*
 * Rendered on demand and then cached, not prebuilt.
 *
 * generateStaticParams used to enumerate the local seed, which is why every
 * real university 404'd: the catalogue holds thousands of records and the seed
 * held two, so any slug outside that pair had no page. Prebuilding thousands
 * would also make every deploy wait on the whole catalogue.
 */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const institution = await fetchInstitution((await params).slug);
  if (!institution) return { title: 'University not found' };

  const where = formatLocation(institution.city, institution.country);

  return {
    title: `${institution.name} — courses, fees and entry requirements`,
    /*
     * The overview first, since it is written prose. `about` is a lowercase
     * fragment — "public research university in Cardiff" — which reads as a
     * truncation in a search result, and both are cut at a word boundary
     * rather than mid-word.
     */
    description:
      summarise(institution.overview) ??
      summarise(institution.about) ??
      `${institution.name} in ${where}. Courses, entry requirements and fees, with Rakuxon's support through the application.`,
    alternates: { canonical: universityRoute(institution.slug) },
  };
}

export default async function UniversityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};

  return <InstitutionDetail slug={slug} query={query} applyMode={{ kind: 'public' }} />;
}
