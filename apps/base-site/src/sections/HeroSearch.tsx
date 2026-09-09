'use client';

import { Search } from 'lucide-react';

import { AppLink, CountryFlag } from '@rakuxon/ui';
import { useEffect, useId, useRef, useState } from 'react';



const DEBOUNCE_MS = 280;
const MIN_QUERY = 2;
const MAX_RESULTS = 8;

/**
 * A suggestion carries its slug, because choosing one goes to that entity's
 * page. Sending every pick to /explore?q=<title> — as this did — makes the
 * visitor search twice for something they had already found.
 */
/**
 * Mirrors the API's search result exactly.
 *
 * It previously declared `title`, while the API sends `name` — so every row
 * rendered with a blank heading and the dropdown looked like an unlabelled
 * list. Keeping the field names identical to the response removes the class of
 * bug rather than the instance.
 */
interface Suggestion {
  type: 'institution' | 'course' | 'article';
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  countryCode?: string;
  /** The matched runs of the name, so the dropdown can show why a row matched. */
  highlight?: readonly { text: string; match: boolean }[];
}

const HREF_BY_TYPE: Record<Suggestion['type'], (slug: string) => string> = {
  institution: (slug) => `/universities/${slug}`,
  course: (slug) => `/courses/${slug}`,
  article: (slug) => `/resources/${slug}`,
};

function suggestionHref(suggestion: Suggestion) {
  return HREF_BY_TYPE[suggestion.type](suggestion.slug);
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
    { label: 'Guidance', items: items.filter((item) => item.type === 'article') },
  ].filter((group) => group.items.length > 0);
}

/**
 * The name with the matched run emphasised.
 *
 * The API returns segments rather than marked-up HTML precisely so this can be
 * rendered as elements — a name containing a tag cannot execute here. Falls
 * back to the plain name if the field is missing.
 */
function HighlightedName({ result }: { result: Suggestion }) {
  if (!result.highlight?.length) return <>{result.name}</>;

  return (
    <>
      {result.highlight.map((segment, index) =>
        segment.match ? (
          <mark
            key={`${segment.text}-${index}`}
            className="bg-transparent font-semibold text-primary"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
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
      <div className="flex flex-col items-stretch gap-4 sm:items-center">
        <div className="flex w-full flex-col gap-2">
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
                          <AppLink
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
                            <span className="flex items-center gap-2">
                              {result.countryCode && (
                                <CountryFlag countryCode={result.countryCode} size="sm" />
                              )}
                              <span className="block font-medium">
                                <HighlightedName result={result} />
                              </span>
                            </span>
                            {result.subtitle && (
                              <span className="mt-0.5 block pl-8 text-xs text-text-muted">
                                {result.subtitle}
                              </span>
                            )}
                          </AppLink>
                        );
                      })}
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>

        {/*
          The Type and Destination selects are gone.
          
          They narrowed a results page the dropdown had already made
          unnecessary — the typeahead searches everything and goes straight to
          the record, so the selects only slowed the common path down. The
          filters that matter now live on /explore, where results are actually
          being compared. The submit button stays: it is the no-JS path, and
          the way to reach the full results page from a broad query.
        */}
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 self-center whitespace-nowrap rounded-md bg-primary px-8 py-3 text-base font-semibold text-on-primary shadow-sm transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto"
        >
          <Search size={18} aria-hidden="true" focusable="false" />
          Search
        </button>
      </div>
    </form>
  );
}
