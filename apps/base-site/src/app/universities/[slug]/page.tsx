import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Award, Building2, GraduationCap, Wallet } from 'lucide-react';

import { CountryFlag, CourseCard, SectionBand, SignUpPrompt } from '@rakuxon/ui';

import { ROUTES, applyHref, courseRoute, universityRoute } from '@/content/routes';
import { INSTITUTIONS, findCourses, findInstitutionBySlug } from '@/lib/catalogue/bank';
import {
  formatDuration,
  formatIntake,
  formatLocation,
  formatMoney,
  nextIntake,
} from '@/lib/catalogue/format';
import { STUDY_LEVEL_LABELS } from '@/lib/catalogue/types';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return INSTITUTIONS.map((institution) => ({ slug: institution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const institution = findInstitutionBySlug((await params).slug);
  if (!institution) return { title: 'University not found' };

  return {
    title: `${institution.name} — courses, fees and entry requirements`,
    description: institution.about.slice(0, 155),
    alternates: { canonical: universityRoute(institution.slug) },
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const institution = findInstitutionBySlug((await params).slug);
  if (!institution) notFound();

  const courses = findCourses({ institutionSlug: institution.slug }).items;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: institution.name,
            description: institution.about,
            address: {
              '@type': 'PostalAddress',
              addressLocality: institution.city,
              addressCountry: institution.countryCode,
            },
          }),
        }}
      />

      <SectionBand tone="muted" labelledBy="university-heading">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1
              id="university-heading"
              className="font-heading text-3xl font-bold leading-tight text-text md:text-4xl"
            >
              {institution.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-base text-text-muted">
              <CountryFlag countryCode={institution.countryCode} />
              {formatLocation(institution.city, institution.country)}
              {institution.fastTrackOffer && (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  Fast-track offer
                </span>
              )}
            </p>
          </div>

          <a
            href={applyHref({ university: institution.slug })}
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Proceed to apply
          </a>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: GraduationCap,
              label: 'Upcoming intake',
              value: institution.upcomingIntake ? formatIntake(institution.upcomingIntake) : '—',
            },
            {
              icon: Wallet,
              label: 'Tuition from',
              value: institution.tuitionFrom ? formatMoney(institution.tuitionFrom) : '—',
            },
            {
              icon: Building2,
              label: 'Courses listed',
              value: String(courses.length),
            },
            {
              icon: Award,
              label: 'English accepted',
              value: institution.englishTests.map((test) => test.test).join(', ') || '—',
            },
          ].map((fact) => (
            <div key={fact.label} className="rounded-lg border border-border bg-surface p-4">
              <dt className="flex items-center gap-2 text-sm text-text-muted">
                <fact.icon size={15} aria-hidden="true" focusable="false" />
                {fact.label}
              </dt>
              <dd className="mt-1 text-base font-semibold text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </SectionBand>

      <SectionBand labelledBy="university-about-heading">
        <h2 id="university-about-heading" className="font-heading text-2xl font-bold text-text">
          About {institution.name}
        </h2>
        <p className="mt-4 max-w-prose text-base text-text-muted">{institution.about}</p>

        {institution.qualityRatings.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-3">
            {institution.qualityRatings.map((rating) => (
              <li
                key={`${rating.scheme}-${rating.year}`}
                className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text-muted"
              >
                <span className="font-semibold text-text">
                  {rating.scheme} {rating.level}
                </span>{' '}
                ({rating.year})
              </li>
            ))}
          </ul>
        )}

        {institution.highlights.length > 0 && (
          <>
            <h3 className="mt-10 font-heading text-lg font-semibold text-text">Highlights</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {institution.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-base text-text-muted">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </>
        )}
      </SectionBand>

      {courses.length > 0 && (
        <SectionBand tone="muted" labelledBy="university-courses-heading">
          <h2
            id="university-courses-heading"
            className="font-heading text-2xl font-bold text-text"
          >
            Courses at {institution.name}
          </h2>
          <ul className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const intake = nextIntake(course);
              return (
                <li key={course.id} className="h-full">
                  <CourseCard
                    title={course.title}
                    institution={course.institutionName}
                    countryCode={course.countryCode}
                    href={courseRoute(course.slug)}
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
                      { label: 'Study level', value: STUDY_LEVEL_LABELS[course.level] },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </SectionBand>
      )}

      <SectionBand labelledBy="university-docs-heading">
        <h2 id="university-docs-heading" className="font-heading text-2xl font-bold text-text">
          Required documents
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          {institution.requiredDocuments.map((group) => (
            <section key={group.id} aria-labelledby={`doc-${group.id}`}>
              <h3
                id={`doc-${group.id}`}
                className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted"
              >
                {group.label}
              </h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item.name} className="rounded-md border border-border bg-surface p-4">
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    {item.minPercentage !== undefined && (
                      <p className="mt-1 text-sm text-text-muted">Minimum {item.minPercentage}%</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {institution.employability && (
          <>
            <h2 className="mt-12 font-heading text-2xl font-bold text-text">Employability</h2>
            <p className="mt-4 max-w-prose text-base text-text-muted">
              {institution.employability}
            </p>
          </>
        )}

        {institution.faqs.length > 0 && (
          <>
            <h2 className="mt-12 font-heading text-2xl font-bold text-text">
              Frequently asked questions
            </h2>
            <dl className="mt-6 flex flex-col gap-4">
              {institution.faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg border border-border bg-surface p-5">
                  <dt className="font-heading text-base font-semibold text-text">{faq.question}</dt>
                  <dd className="mt-2 text-base text-text-muted">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </SectionBand>

      <SectionBand tone="muted" labelledBy="signup-prompt-heading">
        <SignUpPrompt
          heading={`Applying to ${institution.name}?`}
          body="Create a free account to save courses here, track their deadlines, and have your documents checked before they reach the admissions office."
          ctaLabel="Proceed to apply"
          ctaHref={applyHref({ university: institution.slug })}
          secondaryLabel="Book a free consultation"
          secondaryHref={ROUTES.contact}
          reassurance="Free to join. The first consultation costs nothing."
        />
      </SectionBand>
    </>
  );
}
