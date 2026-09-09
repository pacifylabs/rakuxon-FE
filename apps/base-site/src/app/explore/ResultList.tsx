import { CourseCard, InstitutionCard } from '@rakuxon/ui';

import { applyHref, courseRoute, universityRoute } from '@/content/routes';
import { formatDuration, formatIntake, formatMoney, nextIntake, formatLocation } from '@/lib/catalogue/format';
import { STUDY_LEVEL_LABELS } from '@/lib/catalogue/types';
import type { CatalogueResult, Course, InstitutionDetail } from '@/lib/catalogue/types';

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

export function InstitutionResults({
  result,
}: {
  result: CatalogueResult<InstitutionDetail>;
}) {
  return (
    <Shell result={result} noun="Universities">
      <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((institution) => (
          <li key={institution.id} className="h-full">
            <InstitutionCard
              name={institution.name}
              location={formatLocation(institution.city, institution.country)}
              countryCode={institution.countryCode}
              href={universityRoute(institution.slug)}
              applyHref={applyHref({ university: institution.slug })}
              badge={institution.fastTrackOffer ? 'Fast-track offer' : undefined}
              facts={[
                {
                  label: 'Tuition from',
                  value: institution.tuitionFrom ? formatMoney(institution.tuitionFrom) : '—',
                },
                {
                  label: 'Next intake',
                  value: institution.upcomingIntake
                    ? formatIntake(institution.upcomingIntake)
                    : '—',
                },
              ]}
            />
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
                institution={course.institutionName}
                countryCode={course.countryCode}
                href={courseRoute(course.slug)}
                /* Applying needs an account, so this is also the conversion
                   path — the visitor arrives already wanting the thing. */
                applyHref={applyHref({ course: course.slug })}
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
