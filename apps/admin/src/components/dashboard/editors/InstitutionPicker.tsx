'use client';

import { useEffect, useState } from 'react';

import type { AdminInstitutionSummary } from '@rakuxon/contract';

import { useAdminApiClient } from '@/lib/admin-auth';

export interface InstitutionPickerProps {
  value: string;
  valueLabel?: string;
  onChange: (institutionId: string, label: string) => void;
}

/**
 * A type-ahead over the existing admin institutions list endpoint — no new
 * endpoint, just the same `listAdminInstitutions` call the institutions list
 * page already uses.
 */
export function InstitutionPicker({ value, valueLabel, onChange }: InstitutionPickerProps) {
  const client = useAdminApiClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminInstitutionSummary[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim() || query === valueLabel) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const result = await client.listAdminInstitutions({ q: query.trim(), limit: 10 });
      setResults(result.items);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [client, query, valueLabel]);

  return (
    <div className="relative">
      <label htmlFor="institution-picker" className="text-sm font-medium text-text">
        Institution
      </label>
      <input
        id="institution-picker"
        value={query || valueLabel || ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search institutions by name…"
        className="mt-2 w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
      />
      {value && (
        <p className="mt-1 text-xs text-text-muted">Selected id: {value}</p>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-lg">
          {results.map((institution) => (
            <li key={institution.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(institution.id, institution.name);
                  setQuery('');
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-muted"
              >
                {institution.name} <span className="text-text-muted">({institution.countryCode})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
