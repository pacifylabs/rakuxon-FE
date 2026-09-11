'use client';

import { Globe2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, DataTable, EmptyState, StatusBadge } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { AdminCountry } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

function CountriesList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [countries, setCountries] = useState<AdminCountry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCountries(await client.listAdminCountries());
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load countries. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(country: AdminCountry) {
    setPendingCode(country.code);
    try {
      const updated = country.isDestination
        ? await client.deactivateCountry(country.code)
        : await client.activateCountry(country.code);
      setCountries((current) => current?.map((row) => (row.code === updated.code ? updated : row)) ?? null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingCode(null);
    }
  }

  const filtered = (countries ?? []).filter((country) =>
    country.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const columns: DataTableColumn<AdminCountry>[] = [
    {
      header: 'Country',
      cell: (row) => (
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{row.flagEmoji}</span>
          {row.name}
          <span className="text-text-muted">({row.code})</span>
        </span>
      ),
    },
    {
      header: 'Serving',
      cell: (row) => (
        <StatusBadge tone={row.isDestination ? 'positive' : 'neutral'}>
          {row.isDestination ? 'Serving' : 'Not serving'}
        </StatusBadge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) =>
        hasPermission('catalogue.publish') ? (
          <div className="flex justify-end">
            <Button variant={row.isDestination ? 'ghost' : 'primary'} size="md" disabled={pendingCode === row.code} onClick={() => toggle(row)}>
              {row.isDestination ? 'Stop serving' : 'Start serving'}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <section aria-labelledby="countries-heading">
      <h1 id="countries-heading" className="font-heading text-3xl font-bold text-text">
        Countries
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Which countries feed the "where do you want to study" dropdown. Nationality and address
        fields always use the full reference list regardless of this setting.
      </p>

      <label className="mt-6 flex max-w-xs items-center gap-2 text-sm text-text-muted">
        <span className="sr-only">Search by country name</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
        />
      </label>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!countries && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {countries && (
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(row) => row.code}
            emptyState={<EmptyState icon={Globe2} title="No countries match that search" description="Try a different name." />}
          />
        </div>
      )}
    </section>
  );
}

export default function CountriesPage() {
  return (
    <RequirePermission
      permissions={['catalogue.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view the catalogue.</p>}
    >
      <CountriesList />
    </RequirePermission>
  );
}
