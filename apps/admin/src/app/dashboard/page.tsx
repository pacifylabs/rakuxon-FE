'use client';

import { BookOpen, FileStack, GraduationCap, Landmark, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { BarChart, PieChart, StatChip } from '@rakuxon/ui';
import type { AdminDashboardSummary } from '@rakuxon/contract';

import { HealthBadge } from '@/components/HealthBadge';
import { useAdminApiClient } from '@/lib/admin-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
  draft: 'Draft',
  published: 'Published',
  submitted: 'Submitted',
};

function labelFor(key: string): string {
  return STATUS_LABELS[key] ?? key;
}

function StatLink({
  icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
    >
      <StatChip icon={icon} value={String(value)} label={label} />
    </a>
  );
}

function DashboardHome() {
  const client = useAdminApiClient();

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .getDashboardSummary()
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(
          caught instanceof ApiError || caught instanceof NetworkError
            ? caught.message
            : 'Could not load the platform summary. Please try again.',
        );
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <section aria-labelledby="dashboard-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
          Platform administration
        </h1>
        <HealthBadge baseUrl={API_BASE_URL} />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-base text-danger">
          {error}
        </p>
      )}

      {!summary && !error && (
        <p role="status" className="mt-4 text-base text-text-muted">
          Loading…
        </p>
      )}

      {summary && (
        <>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            <StatLink
              icon={ShieldCheck}
              label="Partners"
              value={summary.totalTenants}
              href="/dashboard/tenants"
            />
            <StatLink
              icon={Landmark}
              label="Institutions"
              value={summary.totalInstitutions}
              href="/dashboard/catalogue/institutions"
            />
            <StatLink
              icon={GraduationCap}
              label="Courses"
              value={summary.totalCourses}
              href="/dashboard/catalogue/courses"
            />
            <StatLink
              icon={BookOpen}
              label="Articles"
              value={summary.totalArticles}
              href="/dashboard/catalogue/articles"
            />
            <StatLink
              icon={Users}
              label="Applicants"
              value={summary.totalStudents}
              href="/dashboard/students"
            />
            <StatLink
              icon={FileStack}
              label="Applications"
              value={summary.totalApplications}
              href="/dashboard/applications"
            />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                Applications by status
              </h2>
              <div className="mt-6">
                <BarChart
                  data={summary.applicationsByStatus.map((row) => ({
                    label: labelFor(row.key),
                    value: row.count,
                  }))}
                />
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

            <div>
              <h2 className="font-heading text-lg font-semibold text-text">Partners by status</h2>
              <div className="mt-6">
                <BarChart
                  data={summary.tenantsByStatus.map((row) => ({
                    label: labelFor(row.key),
                    value: row.count,
                  }))}
                />
              </div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                Institutions by status
              </h2>
              <div className="mt-6">
                <PieChart
                  data={summary.institutionsByStatus.map((row) => ({
                    label: labelFor(row.key),
                    value: row.count,
                  }))}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function DashboardPage() {
  return <DashboardHome />;
}
