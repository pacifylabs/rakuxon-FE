'use client';

import { GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { DataTable, EmptyState, Pagination, StatusBadge } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminStudentSummary } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

/**
 * View-only, same as applications: finding and opening a student to support
 * a document review or an application is in scope here, editing their
 * profile on their behalf is not.
 */
function StudentsList() {
  const client = useAdminApiClient();
  const [items, setItems] = useState<AdminStudentSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminStudents({ q: query.trim() || undefined, page });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load students. Please try again.',
      );
    }
  }, [client, query, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const columns: DataTableColumn<AdminStudentSummary>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.fullName}</p>
          <p className="mt-1 text-sm text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Profile',
      cell: (row) =>
        row.profileCompletedAt ? (
          <StatusBadge tone="positive">Complete</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">In progress</StatusBadge>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <a
          href={`/dashboard/students/${row.id}`}
          className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <section aria-labelledby="students-heading">
      <h1 id="students-heading" className="font-heading text-3xl font-bold text-text">
        Students
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Every applicant across every tenant. Open a student to see their full profile and
        documents.
      </p>

      <label className="mt-6 flex max-w-sm items-center gap-2 text-sm text-text-muted">
        <span className="sr-only">Search by name or email</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
        />
      </label>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!items && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {items && (
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState icon={GraduationCap} title="No students match this search" description="Try a different name or email." />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function StudentsPage() {
  return (
    <RequirePermission
      permissions={['students.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view students.</p>}
    >
      <StudentsList />
    </RequirePermission>
  );
}
