'use client';

import { useMemo, useState } from 'react';

import { FilterBar, UniversityCard } from '@rakuxon/ui';

import { UNIVERSITIES, UNIVERSITY_FILTERS } from '@/content/universities';

/**
 * The browse grid plus its filters (docs/04b § 7).
 *
 * Client-side because the filters genuinely filter — the marketing catalogue
 * is a small illustrative list, so there is nothing to fetch.
 */
export function UniversityBrowser() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const matches = useMemo(
    () =>
      UNIVERSITIES.filter((university) =>
        Object.entries(filters).every(
          ([key, value]) => !value || university[key as 'country' | 'level' | 'subject'] === value,
        ),
      ),
    [filters],
  );

  return (
    <>
      <FilterBar
        filters={UNIVERSITY_FILTERS}
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        resultCount={matches.length}
        resultNoun={{ one: 'university', other: 'universities' }}
      />

      {matches.length === 0 ? (
        <p className="mt-12 rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted">
          No universities match those filters. Try clearing one.
        </p>
      ) : (
        <ul
          data-sample="true"
          className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {matches.map((university) => (
            <li key={university.name} className="h-full">
              <UniversityCard
                name={university.name}
                country={university.country}
                src={university.src}
                alt={university.alt}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
