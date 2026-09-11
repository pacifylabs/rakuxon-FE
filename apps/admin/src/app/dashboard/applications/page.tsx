'use client';

import { FileStack } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { ApplicationStatusBadge, DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminApplicationSummary } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

type StatusFilter = 'all' | 'draft' | 'submitted';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
];

/**
 * Read-only — no write controls anywhere on this page, on purpose. Review
 * and decision workflow (accept/reject) is out of scope for this slice; the
 * detail page a row's "View" opens is read-only for the same reason.
 */
function ApplicationsList() {
  const client = useAdminApiClient();
  const [items, setItems] = useState<AdminApplicationSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tenantId, setTenantId] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminApplications({
        status: statusFilter === 'all' ? undefined : statusFilter,
        tenantId: tenantId.trim() || undefined,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load applications. Please try again.',
      );
    }
  }, [client, statusFilter, tenantId, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, tenantId]);

  const columns: DataTableColumn<AdminApplicationSummary>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.studentName}</p>
          <p className="mt-1 text-sm text-text-muted">{row.studentEmail}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      cell: (row) => (
        <div>
          <p className="text-sm text-text">{row.courseTitle}</p>
          <p className="mt-1 text-sm text-text-muted">{row.institutionName}</p>
        </div>
      ),
    },
    { header: 'Tenant', cell: (row) => <span className="text-text-muted">{row.tenantName}</span> },
    { header: 'Created', cell: (row) => <span className="text-text-muted">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { header: 'Status', cell: (row) => <ApplicationStatusBadge status={row.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <a
          href={`/dashboard/applications/${row.id}`}
          className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <section aria-labelledby="applications-heading">
      <h1 id="applications-heading" className="font-heading text-3xl font-bold text-text">
        Applications
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Every application across every tenant. Open one to see its documents and status in full.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-muted text-text-muted hover:bg-accent-soft'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="ml-auto flex items-center gap-2 text-sm text-text-muted">
          <span className="sr-only">Filter by tenant id</span>
          <input
            type="search"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            placeholder="Filter by tenant id…"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </label>
      </div>

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
              <EmptyState icon={FileStack} title="No applications match this filter" description="Try a different status or tenant id." />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function ApplicationsPage() {
  return (
    <RequirePermission
      permissions={['applications.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view applications.</p>}
    >
      <ApplicationsList />
    </RequirePermission>
  );
}
