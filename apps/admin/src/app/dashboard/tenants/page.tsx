'use client';

import { ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { Tenant, TenantStatus } from '@rakuxon/contract';

import { TenantStatusBadge } from '@/components/dashboard/TenantStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STATUS_FILTERS: Array<{ value: TenantStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

function TenantsList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await client.listTenants({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
      });
      setTenants(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load tenants. Please try again.',
      );
    }
  }, [client, statusFilter, page]);

  useEffect(() => {
    setTenants(null);
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  async function runAction(tenant: Tenant, action: 'approve' | 'suspend' | 'reactivate') {
    const verb = action === 'approve' ? 'approve' : action === 'suspend' ? 'suspend' : 'reactivate';
    if (!window.confirm(`${verb[0]?.toUpperCase()}${verb.slice(1)} "${tenant.name}"?`)) return;

    setPendingActionId(tenant.id);
    try {
      const updated =
        action === 'approve'
          ? await client.approveTenant(tenant.id)
          : action === 'suspend'
            ? await client.suspendTenant(tenant.id)
            : await client.reactivateTenant(tenant.id);

      setTenants((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingActionId(null);
    }
  }

  const columns: DataTableColumn<Tenant>[] = [
    {
      header: 'Name',
      cell: (tenant) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{tenant.name}</p>
          <p className="mt-1 text-sm text-text-muted">{tenant.slug}</p>
        </div>
      ),
    },
    { header: 'Status', cell: (tenant) => <TenantStatusBadge status={tenant.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (tenant) => (
        <div className="flex justify-end gap-3">
          {tenant.status === 'pending' && hasPermission('tenants.approve') && (
            <Button variant="primary" size="md" disabled={pendingActionId === tenant.id} onClick={() => runAction(tenant, 'approve')}>
              Approve
            </Button>
          )}
          {tenant.status === 'active' && hasPermission('tenants.suspend') && (
            <Button variant="ghost" size="md" disabled={pendingActionId === tenant.id} onClick={() => runAction(tenant, 'suspend')}>
              Suspend
            </Button>
          )}
          {tenant.status === 'suspended' && hasPermission('tenants.approve') && (
            <Button variant="ghost" size="md" disabled={pendingActionId === tenant.id} onClick={() => runAction(tenant, 'reactivate')}>
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="tenants-heading">
      <h1 id="tenants-heading" className="font-heading text-3xl font-bold text-text">
        Tenants
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Agencies that have registered on the platform. Approve a pending agency before it can
        invite students.
      </p>

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

      {!tenants && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {tenants && (
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={tenants}
            getRowKey={(tenant) => tenant.id}
            emptyState={
              <EmptyState
                icon={ShieldCheck}
                title="No tenants match this filter"
                description="Try a different status, or check back once an agency registers."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}

export default function TenantsPage() {
  return (
    <RequirePermission
      permissions={['tenants.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view tenants.
        </p>
      }
    >
      <TenantsList />
    </RequirePermission>
  );
}
