'use client';

import { Landmark } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminInstitutionSummary, PublishStatus } from '@rakuxon/contract';

import { PublishStatusBadge } from '@/components/dashboard/PublishStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STATUS_FILTERS: Array<{ value: PublishStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'suspended', label: 'Suspended' },
];

function InstitutionsList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [items, setItems] = useState<AdminInstitutionSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminInstitutions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        q: query.trim() || undefined,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load institutions. Please try again.',
      );
    }
  }, [client, statusFilter, query, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  async function runAction(row: AdminInstitutionSummary, action: 'publish' | 'suspend' | 'revert') {
    setPendingId(row.id);
    try {
      const updated =
        action === 'publish'
          ? await client.publishInstitution(row.id)
          : action === 'suspend'
            ? await client.suspendInstitution(row.id)
            : await client.revertInstitutionToDraft(row.id);

      setItems((current) => current?.map((entry) => (entry.id === updated.id ? updated : entry)) ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingId(null);
    }
  }

  const columns: DataTableColumn<AdminInstitutionSummary>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            {row.slug} · {row.countryCode}
          </p>
        </div>
      ),
    },
    { header: 'Status', cell: (row) => <PublishStatusBadge status={row.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <a
            href={`/dashboard/catalogue/institutions/${row.id}`}
            className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          >
            Edit
          </a>
          {row.status !== 'published' && hasPermission('catalogue.publish') && (
            <Button variant="primary" size="md" disabled={pendingId === row.id} onClick={() => runAction(row, 'publish')}>
              Publish
            </Button>
          )}
          {row.status === 'published' && hasPermission('catalogue.suspend') && (
            <Button variant="ghost" size="md" disabled={pendingId === row.id} onClick={() => runAction(row, 'suspend')}>
              Suspend
            </Button>
          )}
          {row.status !== 'draft' && hasPermission('catalogue.publish') && (
            <Button variant="ghost" size="md" disabled={pendingId === row.id} onClick={() => runAction(row, 'revert')}>
              Revert to draft
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="institutions-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="institutions-heading" className="font-heading text-3xl font-bold text-text">
            Institutions
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Publish, suspend, or revert to draft — or edit a record's own fields.
          </p>
        </div>
        {hasPermission('catalogue.publish') && (
          <Button variant="primary" size="md" onClick={() => window.location.assign('/dashboard/catalogue/institutions/new')}>
            New institution
          </Button>
        )}
      </div>

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
          <span className="sr-only">Search by name</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name…"
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
              <EmptyState icon={Landmark} title="No institutions match this filter" description="Try a different status or search term." />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function InstitutionsPage() {
  return (
    <RequirePermission
      permissions={['catalogue.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view the catalogue.</p>}
    >
      <InstitutionsList />
    </RequirePermission>
  );
}
