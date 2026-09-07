'use client';

import { useRouter } from 'next/navigation';

import { GuardedPage, useAuth } from '@rakuxon/auth';
import { Button, SectionBand, Wordmark } from '@rakuxon/ui';

import { HealthBadge } from '@/components/HealthBadge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

function Workspace() {
  const { user, signOut } = useAuth();
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
            Application inbox
          </h1>
          <p className="mt-4 max-w-prose text-base text-text-muted">
            Applications routed to you, requests for information and offers land here as the later
            stages ship.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              { label: 'Signed in as', value: user?.email ?? '—' },
              { label: 'Role', value: user?.role ?? '—' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-surface p-5">
                <dt className="text-sm text-text-muted">{item.label}</dt>
                <dd className="mt-2 break-all font-heading text-base font-semibold text-text">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="scope-heading" className="mt-12">
            <h2 id="scope-heading" className="font-heading text-xl font-bold text-text">
              Institution settings
            </h2>
            <p className="mt-2 max-w-prose text-sm text-text-muted">
              Programme requirements, intakes and delivery preferences. Visible to institution users
              only.
            </p>
          </section>
        </SectionBand>
      </main>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <GuardedPage
      roles={['institution_user']}
      onUnauthenticated={() => router.replace('/login')}
      wrongRole={
        <main className="grid min-h-screen place-items-center px-5">
          <div className="max-w-prose text-center">
            <h1 className="font-heading text-2xl font-bold text-text">
              This workspace is not for your account
            </h1>
            <p className="mt-4 text-base text-text-muted">
              You are signed in, but this area is limited to institution users. Sign out to use a
              different account.
            </p>
          </div>
        </main>
      }
    >
      <Workspace />
    </GuardedPage>
  );
}
