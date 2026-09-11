'use client';

import { BookOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminArticleSummary, PublishStatus } from '@rakuxon/contract';

import { PublishStatusBadge } from '@/components/dashboard/PublishStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STATUS_FILTERS: Array<{ value: PublishStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'suspended', label: 'Suspended' },
];

function ArticlesList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [items, setItems] = useState<AdminArticleSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listAdminArticles({
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
          : 'Could not load articles. Please try again.',
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

  async function runAction(row: AdminArticleSummary, action: 'publish' | 'suspend' | 'revert') {
    setPendingId(row.id);
    try {
      const updated =
        action === 'publish'
          ? await client.publishArticle(row.id)
          : action === 'suspend'
            ? await client.suspendArticle(row.id)
            : await client.revertArticleToDraft(row.id);

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

  const columns: DataTableColumn<AdminArticleSummary>[] = [
    { header: 'Title', cell: (row) => <p className="font-heading text-sm font-semibold text-text">{row.title}</p> },
    { header: 'Status', cell: (row) => <PublishStatusBadge status={row.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <a
            href={`/dashboard/catalogue/articles/${row.id}`}
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
    <section aria-labelledby="articles-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="articles-heading" className="font-heading text-3xl font-bold text-text">
            Articles
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Publish, suspend, or revert to draft — or edit an article's own fields.
          </p>
        </div>
        {hasPermission('catalogue.publish') && (
          <Button variant="primary" size="md" onClick={() => window.location.assign('/dashboard/catalogue/articles/new')}>
            New article
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
            emptyState={<EmptyState icon={BookOpen} title="No articles match this filter" description="Try a different status." />}
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function ArticlesPage() {
  return (
    <RequirePermission
      permissions={['catalogue.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view the catalogue.</p>}
    >
      <ArticlesList />
    </RequirePermission>
  );
}
