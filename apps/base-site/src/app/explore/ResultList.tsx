import { BookOpen, Newspaper } from 'lucide-react';

import { CountryFlag, IconBubble } from '@rakuxon-path/ui';

import type { Article, CatalogueResult, Course, Institution } from '@/lib/catalogue/types';

/**
 * Empty and error states are first-class here: this page depends on upstream
 * sources that can be slow, stale or down, and a browse page that renders
 * nothing with no explanation is worse than one that says what happened.
 */
function Notice({ title, detail }: { title: string; detail?: string }) {
  return (
    <p className="rounded-lg border border-border bg-surface p-8 text-center text-base text-text-muted">
      <span className="block font-semibold text-text">{title}</span>
      {detail && <span className="mt-2 block text-sm">{detail}</span>}
    </p>
  );
}

function Shell({
  result,
  noun,
  children,
}: {
  result: CatalogueResult<unknown>;
  noun: string;
  children: React.ReactNode;
}) {
  if (result.error) {
    return <Notice title={`${noun} are unavailable right now.`} detail={result.error} />;
  }
  if (result.items.length === 0) {
    return (
      <Notice
        title={`No ${noun.toLowerCase()} match that search.`}
        detail="Try a broader term, or clear the country filter."
      />
    );
  }
  return <>{children}</>;
}

export function InstitutionResults({ result }: { result: CatalogueResult<Institution> }) {
  return (
    <Shell result={result} noun="Universities">
      <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((institution) => (
          <li key={institution.id} className="h-full">
            <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm">
              <CountryFlag countryCode={institution.countryCode} />
              <h3 className="mt-4 font-heading text-base font-semibold text-text">
                {institution.name}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {[institution.city, institution.country].filter(Boolean).join(', ')}
              </p>
              {institution.website && (
                <a
                  href={institution.website}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="mt-auto inline-flex items-center gap-1 self-start rounded-sm pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  Visit website
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </article>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function CourseResults({ result }: { result: CatalogueResult<Course> }) {
  return (
    <Shell result={result} noun="Courses">
      <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((course) => (
          <li key={course.id} className="h-full">
            <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm">
              <IconBubble icon={BookOpen} tone="tone2" />
              <h3 className="mt-4 font-heading text-base font-semibold text-text">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{course.institution}</p>
              <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm text-text-muted">
                {course.level && (
                  <div className="flex gap-1">
                    <dt className="sr-only">Level</dt>
                    <dd>{course.level}</dd>
                  </div>
                )}
                {course.subject && (
                  <div className="flex gap-1">
                    <dt className="sr-only">Subject</dt>
                    <dd>{course.subject}</dd>
                  </div>
                )}
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

export function ArticleResults({ result }: { result: CatalogueResult<Article> }) {
  return (
    <Shell result={result} noun="Articles">
      <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((article) => (
          <li key={article.id} className="h-full">
            <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm">
              <IconBubble icon={Newspaper} tone="tone4" />
              <h3 className="mt-4 font-heading text-base font-semibold text-text">
                {article.title}
              </h3>
              {article.excerpt && <p className="mt-2 text-sm text-text-muted">{article.excerpt}</p>}
            </article>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
