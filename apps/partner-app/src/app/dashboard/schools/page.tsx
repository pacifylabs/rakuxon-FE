'use client';

import { BookOpen, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { DataTable, EmptyState, Pagination } from '@rakuxon/ui';
import type { DataTableColumn } from '@rakuxon/ui';
import type { CourseSummary, InstitutionSummary } from '@rakuxon/contract';

type Tab = 'institutions' | 'courses';

function InstitutionsTab() {
  const { apiClient } = useAuth();
  const [items, setItems] = useState<InstitutionSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const result = await apiClient.listInstitutions({
        q: query.trim() || undefined,
        country: country.trim() || undefined,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load universities. Please try again.',
      );
    }
  }, [apiClient, query, country, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query, country]);

  const columns: DataTableColumn<InstitutionSummary>[] = [
    {
      header: 'University',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            {row.city ? `${row.city}, ` : ''}
            {row.country}
          </p>
        </div>
      ),
    },
    {
      header: 'Courses',
      cell: (row) => <span className="text-text">{row.courseCount}</span>,
    },
    {
      header: 'Website',
      className: 'text-right',
      cell: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          >
            Visit
          </a>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        ),
    },
  ];

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex max-w-sm flex-1 items-center gap-2 text-sm text-text-muted">
          <span className="sr-only">Search by name</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <span className="sr-only">Filter by country code</span>
          <input
            type="search"
            value={country}
            onChange={(event) => setCountry(event.target.value.toUpperCase())}
            placeholder="Country code, e.g. GB"
            maxLength={2}
            className="w-40 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </label>
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
                icon={GraduationCap}
                title="No universities match this search"
                description="Try a different name or country code."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}

function CoursesTab() {
  const { apiClient } = useAuth();
  const [items, setItems] = useState<CourseSummary[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const result = await apiClient.listCourses({ q: query.trim() || undefined, page });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load courses. Please try again.',
      );
    }
  }, [apiClient, query, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const columns: DataTableColumn<CourseSummary>[] = [
    {
      header: 'Course',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.title}</p>
          <p className="mt-1 text-sm text-text-muted">{row.institutionName}</p>
        </div>
      ),
    },
    { header: 'Level', cell: (row) => <span className="capitalize text-text">{row.level}</span> },
    {
      header: 'Duration',
      cell: (row) => (
        <span className="text-text-muted">
          {row.durationMonths ? `${row.durationMonths} months` : '—'}
        </span>
      ),
    },
    {
      header: 'Tuition',
      className: 'text-right',
      cell: (row) =>
        row.tuitionAmount ? (
          <span className="text-text">
            {row.tuitionCurrency} {row.tuitionAmount}
            {row.tuitionIsEstimate ? ' (est.)' : ''}
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
  ];

  return (
    <>
      <label className="mt-6 flex max-w-sm items-center gap-2 text-sm text-text-muted">
        <span className="sr-only">Search by course or university</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by course or university…"
          className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
        />
      </label>

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
                icon={BookOpen}
                title="No courses match this search"
                description="Try a different course or university name."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}

export default function SchoolsPage() {
  const [tab, setTab] = useState<Tab>('institutions');

  return (
    <section aria-labelledby="schools-heading">
      <h1 id="schools-heading" className="font-heading text-3xl font-bold text-text">
        Schools
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        The same published catalogue your students see, for briefing them on options.
      </p>

      <div role="group" aria-label="Browse by" className="mt-6 flex flex-wrap gap-2">
        {(['institutions', 'courses'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-muted text-text-muted hover:bg-accent-soft'
            }`}
          >
            {value === 'institutions' ? 'Universities' : 'Courses'}
          </button>
        ))}
      </div>

      {tab === 'institutions' ? <InstitutionsTab /> : <CoursesTab />}
    </section>
  );
}
