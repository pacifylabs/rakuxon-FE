'use client';

import { Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { COVERED_COUNTRIES } from '@/lib/catalogue/institutions';

const TYPES = [
  { value: 'courses', label: 'Courses' },
  { value: 'universities', label: 'Universities' },
  { value: 'articles', label: 'Articles' },
] as const;

type Tab = (typeof TYPES)[number]['value'];

const DEBOUNCE_MS = 280;
const MIN_QUERY = 2;
const MAX_RESULTS = 8;

/**
 * A suggestion carries its slug, because choosing one goes to that entity's
 * page. Sending every pick to /explore?q=<title> — as this did — makes the
 * visitor search twice for something they had already found.
 */
interface Suggestion {
  type: 'institution' | 'course';
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  badges?: readonly string[];
}

function suggestionHref(suggestion: Suggestion) {
  return suggestion.type === 'institution'
    ? `/universities/${suggestion.slug}`
    : `/courses/${suggestion.slug}`;
}

/**
 * One request per keystroke-burst against our own catalogue.
 *
 * The previous version fetched a whole resource list and filtered it in the
 * browser, caching per tab — workable against a few dozen rows, hopeless once
 * the bank holds thousands. Ranking belongs where the data is.
 */
async function fetchSuggestions(q: string, signal: AbortSignal): Promise<Suggestion[]> {
  const params = new URLSearchParams({ q, limit: String(MAX_RESULTS) });
  const response = await fetch(`/api/catalogue/suggest?${params.toString()}`, { signal });
  if (!response.ok) throw new Error('Suggest request failed.');

  const payload = (await response.json()) as { items?: Suggestion[] };
  return payload.items ?? [];
}

/** Institutions first: someone typing a university name wants the university. */
function groupSuggestions(items: readonly Suggestion[]) {
  return [
    { label: 'Universities', items: items.filter((item) => item.type === 'institution') },
    { label: 'Courses', items: items.filter((item) => item.type === 'course') },
  ].filter((group) => group.items.length > 0);
}

/**
 * Search, inside the hero.
 *
 * A real GET form pointing at /explore, so it works before hydration and with
 * JavaScript off, and the results page reproduces from the query string alone.
 * The query field is also a combobox that typeaheads against /api/catalogue.
 */
export function HeroSearch() {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const formRef = useRef<HTMLFormElement>(null);

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('courses');
  const [country, setCountry] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setOpen(false);
      setLoading(false);
      setResults([]);
      setActiveIndex(-1);
      return undefined;
    }

    const abort = new AbortController();
    setOpen(true);
    setLoading(true);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const items = await fetchSuggestions(trimmed, abort.signal);
          if (abort.signal.aborted) return;
          setResults(items);
          setActiveIndex(-1);
        } catch {
          if (abort.signal.aborted) return;
          setResults([]);
        } finally {
          if (!abort.signal.aborted) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      abort.abort();
      window.clearTimeout(timer);
    };
    /* Deliberately not keyed on tab or country: the dropdown searches the
       whole catalogue, and the selects narrow the results page instead. */
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const showList = open && query.trim().length >= MIN_QUERY;
  const activeId = activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

  const fieldClasses =
    'w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2';

  return (
    <form
      ref={formRef}
      role="search"
      action="/explore"
      method="get"
      className="rounded-lg border border-border bg-surface p-4 shadow-md"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-q`} className="text-sm font-medium text-text">
            Search courses, universities and guidance
          </label>
          <div className="relative">
            <input
              id={`${id}-q`}
              name="q"
              type="search"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-activedescendant={activeId}
              placeholder="Computer science, Toronto, scholarships…"
              className={fieldClasses}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (query.trim().length >= MIN_QUERY) setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setOpen(true);
                  setActiveIndex((current) =>
                    results.length === 0 ? -1 : Math.min(current + 1, results.length - 1),
                  );
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setActiveIndex((current) => (current <= 0 ? -1 : current - 1));
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                  setActiveIndex(-1);
                } else if (event.key === 'Enter' && showList && activeIndex >= 0) {
                  event.preventDefault();
                  const option = document.getElementById(`${id}-opt-${activeIndex}`);
                  if (option instanceof HTMLAnchorElement) option.click();
                }
              }}
            />

            <div
              id={listboxId}
              role="listbox"
              hidden={!showList}
              className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-border bg-surface text-left shadow-lg"
            >
              {loading ? (
                <p className="px-4 py-3 text-sm text-text-muted" role="status">
                  Searching…
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-muted" role="status">
                  No matching results
                </p>
              ) : (
                /*
                  Grouped, and each option is a real link to that entity's own
                  page. The running index across groups is what keeps
                  aria-activedescendant and arrow-key order in step with what
                  is on screen — restarting it per group would desynchronise
                  the two.
                */
                (() => {
                  let index = -1;
                  return groupSuggestions(results).map((group) => (
                    <div key={group.label} role="group" aria-label={group.label}>
                      <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                        {group.label}
                      </p>
                      {group.items.map((result) => {
                        index += 1;
                        const optionIndex = index;

                        return (
                          <a
                            key={result.id}
                            id={`${id}-opt-${optionIndex}`}
                            role="option"
                            aria-selected={optionIndex === activeIndex}
                            href={suggestionHref(result)}
                            className={`block px-4 py-3 text-sm focus-visible:outline-none ${
                              optionIndex === activeIndex
                                ? 'bg-accent-soft text-text'
                                : 'text-text hover:bg-accent-soft'
                            }`}
                            onMouseEnter={() => setActiveIndex(optionIndex)}
                          >
                            <span className="block font-medium">{result.title}</span>
                            {result.subtitle && (
                              <span className="mt-0.5 block text-xs text-text-muted">
                                {result.subtitle}
                              </span>
                            )}
                            {result.badges && result.badges.length > 0 && (
                              <span className="mt-2 flex flex-wrap gap-1.5">
                                {result.badges.map((badge) => (
                                  <span
                                    key={badge}
                                    className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted"
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-tab`} className="text-sm font-medium text-text">
              Type
            </label>
            <select
              id={`${id}-tab`}
              name="tab"
              value={tab}
              onChange={(event) => setTab(event.target.value as Tab)}
              className={fieldClasses}
            >
              {TYPES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-country`} className="text-sm font-medium text-text">
              Destination
            </label>
            <select
              id={`${id}-country`}
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className={fieldClasses}
            >
              <option value="">All countries</option>
              {COVERED_COUNTRIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-3 text-base font-semibold text-on-primary shadow-sm transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <Search size={18} aria-hidden="true" focusable="false" />
              Search
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
