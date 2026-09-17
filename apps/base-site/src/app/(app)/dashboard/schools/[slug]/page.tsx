import { InstitutionDetail } from '@/components/catalogue/InstitutionDetail';

/**
 * The same record `/universities/[slug]` shows, reused rather than
 * duplicated (`InstitutionDetail`) — so a signed-in visitor can look at a
 * school and apply to one of its courses without ever leaving the dashboard.
 * `applyMode: 'dashboard'` is what makes "Proceed to apply" create the
 * application directly instead of bouncing through `/register`.
 *
 * No `generateMetadata` here — this route is inside the authenticated
 * dashboard, which `robots.ts` already disallows entirely.
 */
export default async function DashboardSchoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};

  return (
    <InstitutionDetail
      slug={slug}
      query={query}
      applyMode={{ kind: 'dashboard', basePath: '/dashboard/schools' }}
    />
  );
}
