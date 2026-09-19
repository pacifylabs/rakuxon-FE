'use client';

import { Bell } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { DataTable, EmptyState, StatusBadge } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { NotificationTemplateSummary } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';
import { CHANNEL_LABELS, templateKeyLabel } from './labels';

function NotificationTemplatesList() {
  const client = useAdminApiClient();
  const [items, setItems] = useState<NotificationTemplateSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await client.listNotificationTemplates());
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load notification templates. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: DataTableColumn<NotificationTemplateSummary>[] = [
    {
      header: 'Message',
      cell: (row) => <p className="font-heading text-sm font-semibold text-text">{templateKeyLabel(row.key)}</p>,
    },
    {
      header: 'Sends via',
      cell: (row) => <p className="text-sm text-text-muted">{CHANNEL_LABELS[row.channel] ?? row.channel}</p>,
    },
    { header: 'Heading', cell: (row) => <p className="text-sm text-text-muted">{row.heading}</p> },
    {
      header: 'Status',
      cell: (row) =>
        row.enabled ? (
          <StatusBadge tone="positive">Enabled</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Disabled (using default copy)</StatusBadge>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <a
          href={`/dashboard/content/notification-templates/${row.id}`}
          className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
        >
          Edit
        </a>
      ),
    },
  ];

  return (
    <section aria-labelledby="notification-templates-heading">
      <h1 id="notification-templates-heading" className="font-heading text-3xl font-bold text-text">
        Notification templates
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        The copy behind every email and in-app notification the platform sends. A disabled row
        falls back to the built-in default copy — nothing stops sending.
      </p>

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
              <EmptyState icon={Bell} title="No notification templates yet" description="Nothing seeded." />
            }
          />
        </div>
      )}
    </section>
  );
}

export default function NotificationTemplatesPage() {
  return (
    <RequirePermission
      permissions={['notifications.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view notification templates.
        </p>
      }
    >
      <NotificationTemplatesList />
    </RequirePermission>
  );
}
