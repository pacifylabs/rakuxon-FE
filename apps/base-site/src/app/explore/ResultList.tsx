import { CountryFlag, CourseCard } from '@rakuxon/ui';

import { SIGN_UP } from '@/content/routes';
import { courseRoute } from '@/content/routes';
import { formatDuration, formatIntake, formatMoney, nextIntake } from '@/lib/catalogue/format';
import { STUDY_LEVEL_LABELS } from '@/lib/catalogue/types';
import type { CatalogueResult, Course, Institution } from '@/lib/catalogue/types';

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
        {result.items.map((course) => {
          const intake = nextIntake(course);

          return (
            <li key={course.id} className="h-full">
              <CourseCard
                title={course.title}
                institution={`${course.institutionName} · ${course.country}`}
                href={courseRoute(course.slug)}
                /* Applying needs an account, so this is also the conversion
                   path — the visitor arrives already wanting the thing. */
                applyHref={`${SIGN_UP}&course=${course.slug}`}
                badge={course.fastTrackOffer ? 'Fast-track offer' : undefined}
                facts={[
                  { label: 'Fee', value: formatMoney(course.tuition) },
                  { label: 'Duration', value: formatDuration(course.durationMonths) },
                  {
                    label: 'Next intake',
                    value: intake ? formatIntake(intake) : 'No open intake',
                    urgent: intake?.status === 'closing_soon',
                  },
                  { label: 'Course level', value: STUDY_LEVEL_LABELS[course.level] },
                ]}
              />
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
