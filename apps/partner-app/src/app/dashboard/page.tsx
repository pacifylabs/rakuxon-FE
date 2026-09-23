'use client';

import { ClipboardList, GraduationCap, UserCheck, UserX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { BarChart, PieChart, StatChip } from '@rakuxon/ui';
import type { AgencyDashboardSummary } from '@rakuxon/contract';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
};

function labelFor(key: string): string {
  return STATUS_LABELS[key] ?? key;
}

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

function StatLink({
  href,
  icon,
  value,
  label,
}: {
  href: string;
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="rounded-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
    >
      <StatChip icon={icon} value={value} label={label} />
    </a>
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Your students, applications and pipeline in one place.
          </p>
        </div>
        {summary && (
          <span className="whitespace-nowrap text-sm text-text-muted">{summary.tenantName}</span>
        )}
      </div>

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
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatLink
              href="/dashboard/students"
              icon={GraduationCap}
              value={String(summary.totalStudents)}
              label="Students"
            />
            <StatLink
              href="/dashboard/applications"
              icon={ClipboardList}
              value={String(summary.totalApplications)}
              label="Applications"
            />
            <StatLink
              href="/dashboard/students"
              icon={UserCheck}
              value={String(summary.studentsWithCompleteProfile)}
              label="Profiles complete"
            />
            <StatLink
              href="/dashboard/students"
              icon={UserX}
              value={String(summary.studentsWithIncompleteProfile)}
              label="Profiles incomplete"
            />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                Applications by status
              </h2>
              <div className="mt-6">
                {summary.applicationsByStatus.length > 0 ? (
                  <BarChart
                    data={summary.applicationsByStatus.map((row) => ({
                      label: labelFor(row.key),
                      value: row.count,
                    }))}
                  />
                ) : (
                  <p className="text-sm text-text-muted">No applications yet.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                Student profile completion
              </h2>
              <div className="mt-6">
                <PieChart
                  data={[
                    { label: 'Complete', value: summary.studentsWithCompleteProfile },
                    { label: 'In progress', value: summary.studentsWithIncompleteProfile },
                  ]}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
