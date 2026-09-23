'use client';

import { ClipboardList, GraduationCap, UserCheck, UserX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { StatChip } from '@rakuxon/ui';
import type { AgencyDashboardSummary } from '@rakuxon/contract';

function PendingBanner() {
  return (
    <div className="mt-6 rounded-md border border-border bg-surface-muted px-5 py-4">
      <p className="font-heading text-sm font-semibold text-text">
        Your partner account is awaiting approval
      </p>
      <p className="mt-1 text-sm text-text-muted">
        A Rakuxon admin needs to approve your agency before you can invite students. Everything else
        on this dashboard will work as soon as that happens.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, apiClient } = useAuth();
  const [summary, setSummary] = useState<AgencyDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSummary(await apiClient.getAgencyDashboardSummary());
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load your dashboard. Please try again.',
      );
    }
  }, [apiClient]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
        Welcome back, {user?.firstName}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Your students, applications and pipeline in one place.
      </p>

      {summary && summary.tenantStatus !== 'active' && <PendingBanner />}

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!summary && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {summary && (
        <>
          <div className="mt-10 flex flex-wrap gap-10">
            <StatChip icon={GraduationCap} value={String(summary.totalStudents)} label="Students" />
            <StatChip
              icon={ClipboardList}
              value={String(summary.totalApplications)}
              label="Applications"
            />
            <StatChip
              icon={UserCheck}
              value={String(summary.studentsWithCompleteProfile)}
              label="Profiles complete"
            />
            <StatChip
              icon={UserX}
              value={String(summary.studentsWithIncompleteProfile)}
              label="Profiles incomplete"
            />
          </div>

          {summary.applicationsByStatus.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading text-xl font-semibold text-text">
                Applications by status
              </h2>
              <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
                {summary.applicationsByStatus.map((row) => (
                  <div key={row.key}>
                    <dt className="text-sm text-text-muted capitalize">{row.key}</dt>
                    <dd className="mt-1 font-heading text-xl font-bold text-text">{row.count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}
    </section>
  );
}
