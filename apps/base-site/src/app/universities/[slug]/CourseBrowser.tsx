'use client';

import { LayoutGrid, Rows3 } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { CourseCard } from '@rakuxon/ui';

import { applyHref, courseRoute } from '@/content/routes';
import type { ApiCourse } from '@/lib/catalogue/api';
import { cardFacts, feeFromApi, formatDiscipline, formatFee } from '@/lib/catalogue/course-view';
import { STUDY_LEVEL_LABELS } from '@/lib/catalogue/types';

export type CourseListView = 'grid' | 'list';

const STORAGE_KEY = 'rakuxon-course-view';

/*
 * The chosen view lives in localStorage — state outside React, so it is read
 * through useSyncExternalStore the way ThemeToggle reads its cookie: the
 * server renders a stable default and the client corrects itself on hydration,
 * with no setState-in-effect.
 *
 * It is deliberately not a URL parameter. Level and discipline are filters and
 * belong in the URL, where they can be shared and indexed; grid-or-list is a
 * reading preference, like the theme, and a visitor who prefers rows should
 * get rows on the next university too — not only on the link they were sent.
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): CourseListView {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    /* Private mode and blocked storage both throw here; the default still works. */
    return 'grid';
  }
}

/** The server cannot read the visitor's storage, so it renders the default. */
const getServerSnapshot = (): CourseListView => 'grid';

function choose(view: CourseListView) {
  try {
    localStorage.setItem(STORAGE_KEY, view);
  } catch {
    /* Not being able to remember the choice must not stop us honouring it now. */
  }
  listeners.forEach((listener) => listener());
}

/* min-h-12, not 11: the preset replaces the spacing scale and 11 is not in it,
   so `min-h-11` compiles to nothing and the control loses its touch target. */
const TOGGLE_BUTTON =
  'inline-flex min-h-12 items-center gap-2 px-4 text-sm font-medium transition-colors duration-fast ease-standard focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none';

/**
 * A university's courses as cards or as rows, with the choice remembered.
 *
 * Both views carry the same facts. Cards suit a university with a dozen
 * courses; rows suit Exeter's 879, where the fee is read straight down a
 * column and twenty-odd titles fit in a screen.
 */
export function CourseBrowser({ courses }: { courses: readonly ApiCourse[] }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <>
      <div className="mt-6 flex justify-end">
        <div
          role="group"
          aria-label="Course layout"
          className="inline-flex overflow-hidden rounded-md border border-border"
        >
          <button
            type="button"
            aria-pressed={view === 'grid'}
            onClick={() => choose('grid')}
            className={`${TOGGLE_BUTTON} ${
              view === 'grid'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-text-muted hover:text-primary'
            }`}
          >
            <LayoutGrid size={15} aria-hidden="true" focusable="false" />
            Cards
          </button>
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => choose('list')}
            className={`${TOGGLE_BUTTON} border-l border-border ${
              view === 'list'
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-text-muted hover:text-primary'
            }`}
          >
            <Rows3 size={15} aria-hidden="true" focusable="false" />
            List
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <ul className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <li key={course.id} className="h-full">
              <CourseCard
                title={course.title}
                institution={course.institutionName}
                countryCode={course.countryCode}
                href={courseRoute(course.slug)}
                applyHref={applyHref({ course: course.slug })}
                badge={course.fastTrackOffer ? 'Fast-track offer' : undefined}
                facts={cardFacts(course)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
          {courses.map((course) => {
            const fee = feeFromApi(course);
            const discipline = course.disciplines[0];

            return (
              <li
                key={course.id}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border p-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <a
                    href={courseRoute(course.slug)}
                    className="rounded-sm font-heading text-base font-semibold text-text hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                  >
                    {course.title}
                  </a>
                  <p className="mt-1 text-sm text-text-muted">
                    {STUDY_LEVEL_LABELS[course.level]}
                    {discipline ? ` · ${formatDiscipline(discipline)}` : ''}
                  </p>
                </div>
                {/* Right-aligned so fees compare straight down the column. */}
                <span
                  className={`text-sm tabular-nums ${
                    fee ? 'font-semibold text-text' : 'text-text-muted'
                  }`}
                >
                  {fee ? formatFee(fee) : 'Ask an advisor'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
