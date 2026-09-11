'use client';

import { ChevronRight, FileStack, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { ApplicationStatusBadge, EmptyState } from '@rakuxon/ui';
import type { Application } from '@rakuxon/contract';

export default function ApplicationsPage() {
  const client = useApiClient();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await client.listApplications();
        if (!cancelled) setApplications(list);
      } catch (caught) {
        if (cancelled) return;
        setError(
          caught instanceof ApiError || caught instanceof NetworkError
            ? caught.message
            : 'Could not load your applications. Please try again.',
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <section aria-labelledby="applications-heading">
      <h1 id="applications-heading" className="font-heading text-3xl font-bold text-text">
        Applications
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Every application you've started, from draft through submission.
      </p>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!applications && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {applications && applications.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Sparkles}
            title="This is where it all comes together"
            description="Find a course you like and select “Apply” to start your first application — track it here from draft through submission."
            action={
              <a
                href="/dashboard/schools"
                className="rounded-sm font-semibold text-primary underline"
              >
                Browse universities
              </a>
            }
          />
        </div>
      )}

      {applications && applications.length > 0 && (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {applications.map((application) => (
            <li key={application.id}>
              <a
                href={`/dashboard/applications/${application.id}`}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted">
                  <FileStack aria-hidden="true" className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="font-heading text-sm font-semibold text-text">
                    Application {application.id.slice(0, 8)}
                  </p>
                  <div className="mt-2">
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                </div>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-text-muted" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
