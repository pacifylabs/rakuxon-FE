'use client';

import {
  BookOpen,
  FileStack,
  GraduationCap,
  Landmark,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { BarChart, PieChart, SectionBand } from '@rakuxon/ui';
import type { AdminDashboardSummary } from '@rakuxon/contract';

import { HealthBadge } from '@/components/HealthBadge';
import { useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

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

function StatCard({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: number; href: string }) {
  return (
    <a
      href={href}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
    >
      <span className="grid size-10 place-items-center rounded-md bg-accent-soft text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="font-heading text-3xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </a>
  );
}

function DashboardHome() {
  const { admin } = useAdminAuth();
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
    <SectionBand labelledBy="dashboard-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="dashboard-heading" className="font-heading text-3xl font-bold text-text">
            Platform administration
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Signed in as {admin?.email ?? '—'}. Everything below reflects the platform right now.
          </p>
        </div>
        <HealthBadge baseUrl={API_BASE_URL} />
      </div>

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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={ShieldCheck} label="Tenants" value={summary.totalTenants} href="/dashboard/tenants" />
            <StatCard icon={Landmark} label="Institutions" value={summary.totalInstitutions} href="/dashboard/catalogue/institutions" />
            <StatCard icon={GraduationCap} label="Courses" value={summary.totalCourses} href="/dashboard/catalogue/courses" />
            <StatCard icon={BookOpen} label="Articles" value={summary.totalArticles} href="/dashboard/catalogue/articles" />
            <StatCard icon={Users} label="Students" value={summary.totalStudents} href="/dashboard/students" />
            <StatCard icon={FileStack} label="Applications" value={summary.totalApplications} href="/dashboard/applications" />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-lg font-semibold text-text">Applications by status</h2>
              <div className="mt-6">
                <BarChart
                  data={summary.applicationsByStatus.map((row) => ({ label: labelFor(row.key), value: row.count }))}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-lg font-semibold text-text">Student profile completion</h2>
              <div className="mt-6">
                <PieChart
                  data={[
                    { label: 'Complete', value: summary.studentsWithCompleteProfile },
                    { label: 'In progress', value: summary.studentsWithIncompleteProfile },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-lg font-semibold text-text">Tenants by status</h2>
              <div className="mt-6">
                <BarChart data={summary.tenantsByStatus.map((row) => ({ label: labelFor(row.key), value: row.count }))} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="font-heading text-lg font-semibold text-text">Institutions by status</h2>
              <div className="mt-6">
                <PieChart data={summary.institutionsByStatus.map((row) => ({ label: labelFor(row.key), value: row.count }))} />
              </div>
            </div>
          </div>
        </>
      )}

      {admin && admin.permissions.length > 0 && (
        <section aria-labelledby="permissions-heading" className="mt-12">
          <h2 id="permissions-heading" className="font-heading text-xl font-bold text-text">
            Your permissions
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {admin.permissions.map((key) => (
              <li
                key={key}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted"
              >
                {key}
              </li>
            ))}
          </ul>
        </section>
      )}
    </SectionBand>
  );
}

export default function DashboardPage() {
  return <DashboardHome />;
}
