'use client';

import { CalendarDays } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, FormField, StatusBadge } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminIntakeTerm } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

function IntakeTermsList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [terms, setTerms] = useState<AdminIntakeTerm[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setTerms(await client.listAdminIntakeTerms());
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load intake terms. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const label = String(new FormData(form).get('label') ?? '').trim();
    if (!label) return;

    setCreating(true);
    try {
      const nextOrder = (terms?.length ?? 0) > 0 ? Math.max(...terms!.map((t) => t.sortOrder)) + 1 : 0;
      const created = await client.createIntakeTerm({ label, sortOrder: nextOrder });
      setTerms((current) => [...(current ?? []), created]);
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not add that intake term. Please try again.',
      );
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(term: AdminIntakeTerm) {
    setPendingId(term.id);
    try {
      const updated = await client.updateIntakeTerm(term.id, { active: !term.active });
      setTerms((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
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

  const columns: DataTableColumn<AdminIntakeTerm>[] = [
    { header: 'Label', cell: (row) => <p className="font-heading text-sm font-semibold text-text">{row.label}</p> },
    { header: 'Order', cell: (row) => row.sortOrder },
    {
      header: 'Status',
      cell: (row) => (
        <StatusBadge tone={row.active ? 'positive' : 'neutral'}>
          {row.active ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) =>
        hasPermission('catalogue.publish') ? (
          <div className="flex justify-end">
            <Button
              variant={row.active ? 'ghost' : 'primary'}
              size="md"
              disabled={pendingId === row.id}
              onClick={() => toggleActive(row)}
            >
              {row.active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <section aria-labelledby="intake-terms-heading">
      <h1 id="intake-terms-heading" className="font-heading text-3xl font-bold text-text">
        Intake terms
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        The options a student sees on the "Preferred intake" dropdown, in this order. Deactivating
        one hides it from new selections without touching a student who already chose it.
      </p>

      {hasPermission('catalogue.publish') && (
        <form onSubmit={handleCreate} className="mt-6 flex max-w-md items-end gap-3">
          <div className="flex-1">
            <FormField label="New intake term" name="label" placeholder="September 2026" />
          </div>
          <Button type="submit" variant="primary" size="md" disabled={creating}>
            {creating ? 'Adding…' : 'Add'}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!terms && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {terms && (
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={terms}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={CalendarDays}
                title="No intake terms yet"
                description="Add one above to start populating the dropdown."
              />
            }
          />
        </div>
      )}
    </section>
  );
}

export default function IntakeTermsPage() {
  return (
    <RequirePermission
      permissions={['catalogue.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view the catalogue.</p>}
    >
      <IntakeTermsList />
    </RequirePermission>
  );
}
