'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useId, useState } from 'react';

import { SearchField } from '@rakuxon/ui';

import type { ApiCountry } from '@/lib/catalogue/api';

export const TABS = [
  { key: 'courses', label: 'Courses' },
  { key: 'universities', label: 'Universities' },
  { key: 'articles', label: 'Articles' },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

/**
 * Tabs, search and country filter.
 *
 * State lives in the URL rather than component state: a browse page people
 * will share and bookmark should reproduce exactly from its address, and it
 * keeps the results server-rendered instead of fetched on the client.
 *
 * The tabs are real links, so they work before hydration and open in a new tab
 * on middle-click. `role="tab"` is deliberately not used — these navigate, and
 * announcing them as tabs would promise a widget that is not there.
 */
export function ExploreControls({
  tab,
  country,
  query,
  countries,
}: {
  tab: TabKey;
  country: string;
  query: string;
  countries: readonly ApiCountry[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const id = useId();
  const [term, setTerm] = useState(query);

  const push = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params?.toString() ?? '');
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    router.push(`/explore?${merged.toString()}`);
  };

  const fieldClasses =
    'w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2';

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Browse by type">
        <ul className="flex flex-wrap gap-2">
          {TABS.map((entry) => {
            const active = entry.key === tab;
            const merged = new URLSearchParams(params?.toString() ?? '');
            merged.set('tab', entry.key);

            return (
              <li key={entry.key}>
                <a
                  href={`/explore?${merged.toString()}`}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2'
                      : 'inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-text-muted transition-colors duration-fast ease-standard hover:bg-accent-soft hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none'
                  }
                >
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          push({ q: term });
        }}
        className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm sm:grid-cols-[2fr_1fr_auto]"
      >
        <SearchField
          id={`${id}-q`}
          label="Search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Subject, university or keyword"
        />

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-country`} className="text-sm font-medium text-text">
            Country
          </label>
          <select
            id={`${id}-country`}
            value={country}
            onChange={(event) => push({ country: event.target.value })}
            className={fieldClasses}
          >
            <option value="">All countries</option>
            {countries.map((entry) => (
              <option key={entry.countryCode} value={entry.countryCode}>
                {entry.country}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-on-primary shadow-sm transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <Search size={18} aria-hidden="true" focusable="false" />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
