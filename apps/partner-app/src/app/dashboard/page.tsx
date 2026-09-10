'use client';

import { useRouter } from 'next/navigation';

import { GuardedPage, useAuth } from '@rakuxon/auth';
import { Button, SectionBand, Wordmark } from '@rakuxon/ui';

import { HealthBadge } from '@/components/HealthBadge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

function Workspace() {
  const { user, signOut, hasRole } = useAuth();
  const router = useRouter();

  return (
    <>
      <header className="w-full border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-5 py-3">
          <Wordmark href="/dashboard" />
          <div className="flex items-center gap-4">
            <HealthBadge baseUrl={API_BASE_URL} />
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <SectionBand labelledBy="dashboard-heading">
          <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-4 max-w-prose text-base text-text-muted">
            Your pipeline, document review and applications land here as the later stages ship.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { label: 'Signed in as', value: user?.email ?? '—' },
              { label: 'Role', value: user?.role ?? '—' },
              { label: 'Workspace', value: user?.tenantId ?? '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-surface p-5">
                <dt className="text-sm text-text-muted">{item.label}</dt>
                <dd className="mt-2 break-all font-heading text-base font-semibold text-text">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Role-gated: a counselor should not see agency administration. */}
          {hasRole('agency_admin') && (
            <section aria-labelledby="admin-heading" className="mt-12">
              <h2 id="admin-heading" className="font-heading text-xl font-bold text-text">
                Agency administration
              </h2>
              <p className="mt-2 max-w-prose text-sm text-text-muted">
                Invite counselors, manage roles and configure your workspace. Visible to agency
                administrators only.
              </p>
            </section>
          )}
        </SectionBand>
      </main>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <GuardedPage onUnauthenticated={() => router.replace('/login')}>
      <Workspace />
    </GuardedPage>
  );
}
