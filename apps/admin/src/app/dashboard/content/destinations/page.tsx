'use client';

import { Globe2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, ConfirmDialog, DataTable, EmptyState, Pagination, useToast } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminDestinationSummary, PublishStatus } from '@rakuxon/contract';

import { PublishStatusBadge } from '@/components/dashboard/PublishStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STATUS_FILTERS: Array<{ value: PublishStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'suspended', label: 'Suspended' },
];

function DestinationsList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const toast = useToast();
  const [items, setItems] = useState<AdminDestinationSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminDestinationSummary | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminDestinations({
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
          : 'Could not load destinations. Please try again.',
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

  async function runAction(row: AdminDestinationSummary, action: 'publish' | 'suspend' | 'revert') {
    setPendingId(row.id);
    try {
      const updated =
        action === 'publish'
          ? await client.publishDestination(row.id)
          : action === 'suspend'
            ? await client.suspendDestination(row.id)
            : await client.revertDestinationToDraft(row.id);

      setItems(
        (current) => current?.map((entry) => (entry.id === updated.id ? updated : entry)) ?? null,
      );
      toast.success(
        action === 'publish'
          ? 'Destination published.'
          : action === 'suspend'
            ? 'Destination suspended.'
            : 'Destination reverted to draft.',
      );
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingId(null);
    }
  }

  async function confirmSuspend() {
    if (!suspendTarget) return;
    await runAction(suspendTarget, 'suspend');
    setSuspendTarget(null);
  }

  const columns: DataTableColumn<AdminDestinationSummary>[] = [
    {
      header: 'Destination',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.shortName}</p>
          <p className="mt-1 text-sm text-text-muted">{row.slug}</p>
        </div>
      ),
    },
    { header: 'Tagline', cell: (row) => <p className="text-sm text-text-muted">{row.tagline}</p> },
    { header: 'Order', cell: (row) => row.displayOrder },
    { header: 'Status', cell: (row) => <PublishStatusBadge status={row.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <a
            href={`/dashboard/content/destinations/${row.id}`}
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
              onClick={() => setSuspendTarget(row)}
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
    <section aria-labelledby="destinations-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="destinations-heading" className="font-heading text-3xl font-bold text-text">
            Destinations
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            The written country guides behind /destinations. A country can serve applicants with no
            guide at all — this is only the handful the client has full copy for.
          </p>
        </div>
        {hasPermission('content.manage') && (
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.assign('/dashboard/content/destinations/new')}
          >
            New destination
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
                icon={Globe2}
                title="No destinations match this filter"
                description="Try a different status."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={`Suspend "${suspendTarget?.shortName}"?`}
        description="It will no longer appear on the site until republished."
        confirmLabel="Suspend"
        tone="danger"
        confirming={pendingId === suspendTarget?.id}
        onConfirm={confirmSuspend}
      />
    </section>
  );
}

export default function DestinationsPage() {
  return (
    <RequirePermission
      permissions={['content.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view content.
        </p>
      }
    >
      <DestinationsList />
    </RequirePermission>
  );
}
