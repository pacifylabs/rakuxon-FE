import type { Metadata } from 'next';

import { fetchCountries, fetchInstitutions } from '@/lib/catalogue/api';
import { UniversityBrowser } from '@/components/catalogue/UniversityBrowser';

export const metadata: Metadata = {
  title: 'Schools',
};

type Search = Promise<Record<string, string | string[] | undefined>>;

const asString = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

/**
 * The same catalogue /universities browses, reused rather than duplicated —
 * so a signed-in visitor can look for a school without leaving the dashboard,
 * and the two listings can never drift apart. `UniversityBrowser` is a plain
 * component with no client-only auth dependency of its own, which is what
 * makes reusing it here possible.
 */
export default async function DashboardSchoolsPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const country = asString(params.country).toUpperCase();
  const q = asString(params.q);
  const page = Number(asString(params.page)) || 1;

  const [countries, result] = await Promise.all([
    fetchCountries(),
    fetchInstitutions({ country, q, page, limit: 24 }),
  ]);

  return (
    <section aria-labelledby="schools-heading">
      <h1 id="schools-heading" className="font-heading text-3xl font-bold text-text">
        Schools
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Browse the catalogue and find where to apply next.
      </p>

      <div className="mt-8">
        <UniversityBrowser
          countries={countries}
          result={result}
          country={country}
          query={q}
          basePath="/dashboard/schools"
          showSignUpPrompt={false}
        />
      </div>
    </section>
  );
}
