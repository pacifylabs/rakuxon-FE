'use client';

import { ScrollText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AuditLogEntry } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

const ACTOR_LABEL: Record<AuditLogEntry['actorType'], string> = {
  admin: 'Admin',
  student: 'Student',
  system: 'System',
};

const RESOURCE_FILTERS = [
  { value: '', label: 'All resources' },
  { value: 'application', label: 'Applications' },
  { value: 'student', label: 'Applicants' },
  { value: 'tenant', label: 'Partners' },
  { value: 'admin', label: 'Admins' },
  { value: 'admin-role', label: 'Roles' },
  { value: 'document', label: 'Documents' },
];

/**
 * Every admin and student action across the platform, one row each —
 * separate from a resource's own scoped `HistoryPanel`, which reuses
 * whatever permission already lets an admin view that resource. This is the
 * superadmin-only view across everything, gated by `platform.audit`.
 */
function ActivityLogList() {
  const client = useAdminApiClient();
  const [items, setItems] = useState<AuditLogEntry[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const result = await client.listAuditLog({ resourceType: resourceType || undefined, page });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load the activity log. Please try again.',
      );
    }
  }, [client, resourceType, page]);

  useEffect(() => {
    setItems(null);
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [resourceType]);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      header: 'When',
      cell: (row) => (
        <span className="whitespace-nowrap text-text-muted">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Who',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">
            {row.actorName ?? ACTOR_LABEL[row.actorType]}
          </p>
          <p className="mt-1 text-sm text-text-muted">{ACTOR_LABEL[row.actorType]}</p>
        </div>
      ),
    },
    { header: 'What', cell: (row) => <span className="text-text">{row.description}</span> },
    {
      header: 'Resource',
      cell: (row) => (
        <span className="text-text-muted">
          {row.resourceType ? `${row.resourceType} · ${row.resourceId?.slice(0, 8)}` : '—'}
        </span>
      ),
    },
  ];

  return (
    <section aria-labelledby="activity-log-heading">
      <h1 id="activity-log-heading" className="font-heading text-3xl font-bold text-text">
        Activity log
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Every admin and student action across the platform, newest first.
      </p>

      <div role="group" aria-label="Filter by resource" className="mt-6 flex flex-wrap gap-2">
        {RESOURCE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setResourceType(filter.value)}
            aria-pressed={resourceType === filter.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              resourceType === filter.value
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
                icon={ScrollText}
                title="Nothing recorded yet"
                description="Actions taken across the platform will show up here."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function ActivityLogPage() {
  return (
    <RequirePermission
      permissions={['platform.audit']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view the platform activity log.
        </p>
      }
    >
      <ActivityLogList />
    </RequirePermission>
  );
}
