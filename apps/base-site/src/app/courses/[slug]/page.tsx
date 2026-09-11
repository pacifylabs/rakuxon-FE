import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CalendarClock, GraduationCap, MapPin, Wallet } from 'lucide-react';

import { AppLink, CountryFlag, SectionBand, SignUpPrompt } from '@rakuxon/ui';

import { ROUTES, applyHref, courseRoute, universityRoute } from '@/content/routes';
import { fetchCourse, fetchCourses } from '@/lib/catalogue/api';
import { COURSES, findCourseBySlug, findCourses } from '@/lib/catalogue/bank';
import {
  feeFromApi,
  firstOpenIntake,
  formatFee,
  formatSubject,
  fromApiCourse,
  fromBankCourse,
} from '@/lib/catalogue/course-view';
import type { CourseFee, CourseView } from '@/lib/catalogue/course-view';
import { formatDate, formatDuration, formatIntake, formatMoney, summarise } from '@/lib/catalogue/format';
import { STUDY_LEVEL_LABELS, STUDY_MODE_LABELS } from '@/lib/catalogue/types';
import type { StudyLevel } from '@/lib/catalogue/types';

import { ApplyPanel } from './ApplyPanel';

/*
 * Rendered on demand and then cached, like the university pages. The catalogue
 * holds forty thousand courses, and prebuilding them would make every deploy
 * wait on all of them; the hand-written samples still prebuild.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }));
}

interface LoadedCourse {
  course: CourseView;
  /** Where it came from, so "other courses" come from the same place. */
  source: 'catalogue' | 'sample';
}

/** The catalogue first; the hand-written samples second, so their links still resolve. */
async function loadCourse(slug: string): Promise<LoadedCourse | null> {
  const fromCatalogue = await fetchCourse(slug);
  if (fromCatalogue) return { course: fromApiCourse(fromCatalogue), source: 'catalogue' };

  const sample = findCourseBySlug(slug);
  return sample ? { course: fromBankCourse(sample), source: 'sample' } : null;
}

/** "approx. £ 17,500 · 1 year" — what a related-course link can say in one line. */
function summaryLine(entry: { fee?: CourseFee; durationMonths?: number; level: StudyLevel }): string {
  return [
    entry.fee ? formatFee(entry.fee) : undefined,
    entry.durationMonths ? formatDuration(entry.durationMonths) : STUDY_LEVEL_LABELS[entry.level],
  ]
    .filter(Boolean)
    .join(' · ');
}

async function loadRelated({ course, source }: LoadedCourse) {
  if (source === 'sample') {
    return findCourses({ institutionSlug: course.institutionSlug })
      .items.filter((entry) => entry.slug !== course.slug)
      .map((entry) => ({ slug: entry.slug, title: entry.title, line: summaryLine(fromBankCourse(entry)) }));
  }

  const { items } = await fetchCourses({ institutionSlug: course.institutionSlug, limit: 4 });
  return items
    .filter((entry) => entry.slug !== course.slug)
    .slice(0, 3)
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      line: summaryLine({ fee: feeFromApi(entry), durationMonths: entry.durationMonths, level: entry.level }),
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const loaded = await loadCourse((await params).slug);
  if (!loaded) return { title: 'Course not found' };

  const { course } = loaded;
  return {
    title: `${course.title} — ${course.institutionName}`,
    description:
      summarise(course.overview) ??
      `${course.title} at ${course.institutionName}, ${course.country}. Fees, entry requirements and how to apply, with Rakuxon's support.`,
    alternates: { canonical: courseRoute(course.slug) },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const loaded = await loadCourse((await params).slug);
  if (!loaded) notFound();

  const { course } = loaded;
  const intake = firstOpenIntake(course.intakes);
  const related = await loadRelated(loaded);
  const hasRequirements = course.entryRequirements.length > 0 || course.englishTests.length > 0;
  const subject = course.disciplines[0];

  return (
    <>
      {/*
        Course JSON-LD. These pages are the organic-search surface, and a
        course without structured data is invisible to the results that carry
        fees and providers.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.overview,
            provider: {
              '@type': 'EducationalOrganization',
              name: course.institutionName,
            },
          }),
        }}
      />

      <SectionBand tone="muted" labelledBy="course-heading">
        <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <AppLink href={ROUTES.explore} className="rounded-sm underline-offset-4 hover:underline">
                Explore
              </AppLink>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <AppLink
                href={universityRoute(course.institutionSlug)}
                className="rounded-sm underline-offset-4 hover:underline"
              >
                {course.institutionName}
              </AppLink>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-text">
              {course.title}
            </li>
          </ol>
        </nav>

        <h1
          id="course-heading"
          className="mt-4 font-heading text-3xl font-bold leading-tight text-text md:text-4xl"
        >
          {course.title}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-base text-text-muted">
          <CountryFlag countryCode={course.countryCode} />
          <AppLink
            href={universityRoute(course.institutionSlug)}
            className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {course.institutionName}
          </AppLink>
          <span aria-hidden="true">·</span>
          {course.country}
        </p>
      </SectionBand>

      <SectionBand labelledBy="course-overview-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <h2 id="course-overview-heading" className="font-heading text-2xl font-bold text-text">
              Course overview
            </h2>
            <p className="mt-4 max-w-prose text-base text-text-muted">
              {/* Built only from what the record holds; imported courses rarely
                  carry prose, and inventing some would be a claim, not a summary. */}
              {course.overview ??
                `${course.title} is a ${STUDY_LEVEL_LABELS[course.level].toLowerCase()} course at ${course.institutionName} in ${course.country}. Our advisors can take you through its entry requirements, intakes and fees before you apply.`}
            </p>

            {course.highlights.length > 0 && (
              <>
                <h2 className="mt-12 font-heading text-2xl font-bold text-text">
                  Key programme highlights
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {course.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-base text-text-muted">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/*
              Hidden entirely when there is nothing to list. An empty
              "Requirements" heading does not read as "not published yet" — it
              reads as "none needed", which is the opposite of what we know.
            */}
            {hasRequirements && (
              <>
                <h2 className="mt-12 font-heading text-2xl font-bold text-text">Requirements</h2>
                <p className="mt-3 max-w-prose text-base text-text-muted">
                  Grouped the way you will gather them. Requirements can vary with the study options
                  you choose.
                </p>
                <div className="mt-6 flex flex-col gap-6">
                  {course.entryRequirements.map((group) => (
                    <section key={group.id} aria-labelledby={`req-${group.id}`}>
                      <h3
                        id={`req-${group.id}`}
                        className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted"
                      >
                        {group.label}
                      </h3>
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((item) => (
                          <li
                            key={item.name}
                            className="rounded-md border border-border bg-surface p-4"
                          >
                            <p className="text-sm font-medium text-text">{item.name}</p>
                            {item.minPercentage !== undefined && (
                              <p className="mt-1 text-sm text-text-muted">
                                Minimum {item.minPercentage}%
                              </p>
                            )}
                            {item.note && <p className="mt-1 text-sm text-text-muted">{item.note}</p>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {course.englishTests.length > 0 && (
                    <section aria-labelledby="req-english">
                      <h3
                        id="req-english"
                        className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted"
                      >
                        English language
                      </h3>
                      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {course.englishTests.map((test) => (
                          <li key={test.test} className="rounded-md border border-border bg-surface p-4">
                            <p className="text-sm font-medium text-text">{test.test}</p>
                            <p className="mt-1 text-sm text-text-muted">{test.minScore}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </>
            )}

            {course.intakes.length > 0 && (
              <>
                <h2 className="mt-12 font-heading text-2xl font-bold text-text">Intakes</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {course.intakes.map((entry) => (
                    <li
                      key={`${entry.month}-${entry.year}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-4"
                    >
                      <span className="text-base font-semibold text-text">{formatIntake(entry)}</span>
                      {entry.applicationDeadline && (
                        <span
                          className={
                            entry.status === 'closing_soon'
                              ? 'text-sm font-semibold text-tint-urgent'
                              : 'text-sm text-text-muted'
                          }
                        >
                          Apply by {formatDate(entry.applicationDeadline)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {course.scholarships.length > 0 && (
              <>
                <h2 className="mt-12 font-heading text-2xl font-bold text-text">
                  Fees and funding
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {course.scholarships.map((scholarship) => (
                    <li
                      key={scholarship.name}
                      className="rounded-md border border-border bg-surface p-4"
                    >
                      <p className="text-base font-semibold text-text">
                        {scholarship.name}
                        {scholarship.amount && ` — ${formatMoney(scholarship.amount)}`}
                      </p>
                      {scholarship.note && (
                        <p className="mt-1 text-sm text-text-muted">{scholarship.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <ApplyPanel
            applyHref={applyHref({ course: course.slug })}
            tuition={course.fee ? formatFee(course.fee) : 'Ask an advisor'}
            tuitionPer={
              course.fee ? (course.fee.per === 'year' ? 'per year' : 'total') : 'not published yet'
            }
            deadline={
              intake?.applicationDeadline ? formatDate(intake.applicationDeadline) : undefined
            }
            urgent={intake?.status === 'closing_soon'}
            facts={[
              /* Only facts the record holds: an imported course lists no intakes
                 or duration, and two "Ask an advisor" rows would say only that.
                 "No open intake" appears only when intakes are known and closed. */
              ...(intake
                ? [{ label: 'Start date', value: formatIntake(intake) }]
                : course.intakes.length > 0
                  ? [{ label: 'Start date', value: 'No open intake' }]
                  : []),
              ...(course.durationMonths
                ? [{ label: 'Duration', value: formatDuration(course.durationMonths) }]
                : []),
              ...(course.campus ? [{ label: 'Campus', value: course.campus }] : []),
              ...(course.studyMode
                ? [{ label: 'Mode of study', value: STUDY_MODE_LABELS[course.studyMode] }]
                : []),
              { label: 'Level', value: STUDY_LEVEL_LABELS[course.level] },
              ...(subject ? [{ label: 'Subject', value: formatSubject(subject) }] : []),
            ]}
            offerResponseWeeks={course.offerResponseWeeks}
          />
        </div>
      </SectionBand>

      {/*
        Out of the narrow column and across the page.

        Four cards two-up inside a half-width column is what made this stretch
        look sparse: the sticky panel holds the right side for the whole scroll,
        so anything that does not need to sit beside it should not.
      */}
      <SectionBand tone="muted" labelledBy="course-help-heading">
        <h2 id="course-help-heading" className="font-heading text-2xl font-bold text-text">
          How Rakuxon helps with this application
        </h2>
        <p className="mt-3 max-w-prose text-base text-text-muted">
          Eleven years of doing this for students from Lagos, Accra, Nairobi and Doha. The
          consultancy costs nothing, and it is where almost every application here starts.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: GraduationCap,
              title: 'Free consultancy',
              text: 'We talk through your grades, budget and goals before you commit to a course.',
            },
            {
              icon: Wallet,
              title: 'The real cost',
              text: 'Tuition, living costs, visa fees and the deposit, in one number you can plan against.',
            },
            {
              icon: CalendarClock,
              title: 'Deadline tracking',
              text: 'Every intake and document date tracked, so a deadline never passes quietly.',
            },
            {
              icon: MapPin,
              title: 'Arrival support',
              text: 'Accommodation, airport transfer and orientation once the offer lands.',
            },
          ].map((item) => (
            <li key={item.title} className="h-full">
              <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-5">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-accent-soft text-primary">
                  <item.icon size={18} aria-hidden="true" focusable="false" />
                </span>
                <h3 className="mt-4 font-heading text-base font-semibold text-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionBand>

      {related.length > 0 && (
        <SectionBand tone="muted" labelledBy="related-heading">
          <h2 id="related-heading" className="font-heading text-2xl font-bold text-text">
            Other courses at {course.institutionName}
          </h2>
          <ul
            className={`mt-6 grid gap-4 sm:grid-cols-2 ${
              related.length > 2 ? 'lg:grid-cols-3' : ''
            }`}
          >
            {related.map((entry) => (
              <li key={entry.slug}>
                <AppLink
                  href={courseRoute(entry.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-sm transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <span className="font-heading text-base font-semibold text-text">
                    {entry.title}
                  </span>
                  {entry.line && <span className="mt-1 text-sm text-text-muted">{entry.line}</span>}
                </AppLink>
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      <SectionBand labelledBy="signup-prompt-heading">
        <SignUpPrompt
          heading="Apply with someone who has done this before"
          body="Create a free account to save this course, track its deadline, and have your documents checked before they reach the university."
          ctaLabel="Proceed to apply"
          ctaHref={applyHref({ course: course.slug })}
          secondaryLabel="Book a free consultation"
          secondaryHref={ROUTES.contact}
          reassurance="Free to join. The first consultation costs nothing."
        />
      </SectionBand>
    </>
  );
}
