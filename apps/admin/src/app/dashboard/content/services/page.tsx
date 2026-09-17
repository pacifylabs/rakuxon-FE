'use client';

import { Compass } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminServiceSummary, PublishStatus } from '@rakuxon/contract';

import { PublishStatusBadge } from '@/components/dashboard/PublishStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STATUS_FILTERS: Array<{ value: PublishStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'suspended', label: 'Suspended' },
];

function ServicesList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [items, setItems] = useState<AdminServiceSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminServices({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load services. Please try again.',
      );
    }
  }, [client, statusFilter, page]);

  useEffect(() => {
    setItems(null);
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  async function runAction(row: AdminServiceSummary, action: 'publish' | 'suspend' | 'revert') {
    setPendingId(row.id);
    try {
      const updated =
        action === 'publish'
          ? await client.publishService(row.id)
          : action === 'suspend'
            ? await client.suspendService(row.id)
            : await client.revertServiceToDraft(row.id);

      setItems(
        (current) => current?.map((entry) => (entry.id === updated.id ? updated : entry)) ?? null,
      );
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

  const columns: DataTableColumn<AdminServiceSummary>[] = [
    {
      header: 'Title',
      cell: (row) => <p className="font-heading text-sm font-semibold text-text">{row.title}</p>,
    },
    { header: 'Slug', cell: (row) => <p className="text-sm text-text-muted">{row.slug}</p> },
    { header: 'Strand', cell: (row) => (row.strand === 'travel' ? 'Travel' : 'Education') },
    { header: 'Status', cell: (row) => <PublishStatusBadge status={row.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <a
            href={`/dashboard/content/services/${row.id}`}
            className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          >
            Edit
          </a>
          {row.status !== 'published' && hasPermission('content.manage') && (
            <Button
              variant="primary"
              size="md"
              disabled={pendingId === row.id}
              onClick={() => runAction(row, 'publish')}
            >
              Publish
            </Button>
          )}
          {row.status === 'published' && hasPermission('content.manage') && (
            <Button
              variant="ghost"
              size="md"
              disabled={pendingId === row.id}
              onClick={() => runAction(row, 'suspend')}
            >
              Suspend
            </Button>
          )}
          {row.status !== 'draft' && hasPermission('content.manage') && (
            <Button
              variant="ghost"
              size="md"
              disabled={pendingId === row.id}
              onClick={() => runAction(row, 'revert')}
            >
              Revert to draft
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="services-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="services-heading" className="font-heading text-3xl font-bold text-text">
            Services
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            What shows on the public /services page and its per-service detail pages.
          </p>
        </div>
        {hasPermission('content.manage') && (
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.assign('/dashboard/content/services/new')}
          >
            New service
          </Button>
        )}
      </div>

      <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
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
              <EmptyState
                icon={Compass}
                title="No services match this filter"
                description="Try a different status."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function ServicesPage() {
  return (
    <RequirePermission
      permissions={['content.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view content.
        </p>
      }
    >
      <ServicesList />
    </RequirePermission>
  );
}
