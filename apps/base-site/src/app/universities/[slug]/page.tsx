import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Award, Building2, CalendarDays, Globe2, GraduationCap, Users, Wallet } from 'lucide-react';

import { CountryFlag, CourseCard, SectionBand, SignUpPrompt } from '@rakuxon/ui';

import { ROUTES, applyHref, articleRoute, courseRoute, universityRoute } from '@/content/routes';
import { fetchArticles, fetchInstitution, fetchInstitutions } from '@/lib/catalogue/api';
import { findCourses } from '@/lib/catalogue/bank';
import {
  formatDuration,
  formatIntake,
  formatLocation,
  formatMoney,
  nextIntake,
} from '@/lib/catalogue/format';
import { STUDY_LEVEL_LABELS } from '@/lib/catalogue/types';

/*
 * Rendered on demand and then cached, not prebuilt.
 *
 * generateStaticParams used to enumerate the local seed, which is why every
 * real university 404'd: the catalogue holds thousands of records and the seed
 * held two, so any slug outside that pair had no page. Prebuilding thousands
 * would also make every deploy wait on the whole catalogue.
 */
export const revalidate = 300;

/** First 155 characters, ending on a word rather than mid-syllable. */
function summarise(text?: string | null): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= 155) return trimmed;

  const cut = trimmed.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const institution = await fetchInstitution((await params).slug);
  if (!institution) return { title: 'University not found' };

  const where = formatLocation(institution.city, institution.country);

  return {
    title: `${institution.name} — courses, fees and entry requirements`,
    /*
     * The overview first, since it is written prose. `about` is a lowercase
     * fragment — "public research university in Cardiff" — which reads as a
     * truncation in a search result, and both are cut at a word boundary
     * rather than mid-word.
     */
    description:
      summarise(institution.overview) ??
      summarise(institution.about) ??
      `${institution.name} in ${where}. Courses, entry requirements and fees, with Rakuxon's support through the application.`,
    alternates: { canonical: universityRoute(institution.slug) },
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const institution = await fetchInstitution((await params).slug);
  if (!institution) notFound();

  const courses = findCourses({ institutionSlug: institution.slug }).items;

  /*
   * Everything else the page can honestly say about this institution, fetched
   * in parallel — neither depends on the other, and awaiting them in sequence
   * adds a whole round trip to a page that already waited for the record.
   *
   * Courses are not wired yet, so without these the page was a name, four
   * facts and a one-line description. Neighbours and destination guidance are
   * real rows we already hold; inventing prose to fill the space would not be.
   */
  const [nearby, guidance] = await Promise.all([
    /* Same city where we know it, same country otherwise. The browse filter
       matches city as well as name, which is what makes this one call. */
    fetchInstitutions({
      country: institution.countryCode,
      q: institution.city ?? undefined,
      limit: 7,
    }),
    fetchArticles({ country: institution.countryCode, limit: 3 }),
  ]);

  const neighbours = nearby.items.filter((entry) => entry.slug !== institution.slug).slice(0, 6);

  /*
   * Wikidata descriptions are lowercase sentence fragments — "public research
   * university in Cardiff, United Kingdom" — written to sit after a label, not
   * to stand alone. Dropped straight into a paragraph under a heading they read
   * as a truncation. Restoring the subject makes the same fact a sentence.
   */
  const about = institution.about?.trim()
    ? /^[a-z]/.test(institution.about.trim())
      ? `${institution.name} is a ${institution.about.trim()}.`
      : institution.about.trim()
    : null;

  /*
   * new URL throws on anything it cannot parse, and these websites are
   * imported for 6,400 institutions — one malformed value would take the whole
   * page down rather than dropping one card off it.
   */
  const host = (() => {
    if (!institution.website) return null;
    try {
      return new URL(institution.website).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  })();

  /* Wikipedia extracts come back as plain text with blank-line paragraphs. */
  const overviewParagraphs = (institution.overview ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  /*
   * Campus photo, with a link back to the file page.
   *
   * Commons images are freely licensed but most are CC BY-SA, which obliges
   * attribution. We do not hold the photographer's name per image, and the
   * file page does — so the credit links there rather than inventing one.
   * Logos are deliberately not treated this way: those are trademarks and a
   * licence on the file does not grant use of the mark.
   */
  const heroImage = institution.heroImageUrl ?? null;
  const heroCreditUrl = heroImage?.includes('/Special:FilePath/')
    ? `https://commons.wikimedia.org/wiki/File:${heroImage.split('/Special:FilePath/')[1]?.split('?')[0] ?? ''}`
    : null;

  const hasDocuments = (institution.requiredDocuments ?? []).length > 0;
  const hasFaqs = (institution.faqs ?? []).length > 0;
  const hasApplicationDetail = hasDocuments || Boolean(institution.employability) || hasFaqs;

  /* The band is labelled by whichever of its headings actually renders. An
     aria-labelledby pointing at an id that was conditioned away names the
     section nothing at all, which is worse than not labelling it. */
  const docsBandLabel = hasDocuments
    ? 'university-docs-heading'
    : institution.employability
      ? 'university-employability-heading'
      : 'university-faqs-heading';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: institution.name,
            description: overviewParagraphs[0] ?? about,
            address: {
              '@type': 'PostalAddress',
              addressLocality: institution.city,
              addressCountry: institution.countryCode,
            },
          }),
        }}
      />

      {heroImage && (
        <div className="relative w-full overflow-hidden bg-surface-muted">
          {/* A plain img, not next/image: these are hotlinked from Commons and
              adding a remote pattern per host buys nothing here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={`${institution.name} campus`}
            /* Aspect ratio, not a fixed height: the preset replaces the
               spacing scale, so an off-scale height compiles to nothing and
               the banner collapses to zero. */
            className="aspect-[16/6] w-full object-cover sm:aspect-[16/5]"
            loading="eager"
          />
          {heroCreditUrl && (
            <a
              href={heroCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              /* bg-scrim with opacity, not bg-scrim/70: the preset maps colours
                 to a bare var(), which Tailwind cannot apply an alpha to. */
              className="absolute bottom-2 right-2 rounded-sm bg-scrim px-2 py-1 text-xs text-on-scrim underline opacity-90 focus-visible:outline-none focus-visible:ring"
            >
              Photo: Wikimedia Commons
            </a>
          )}
        </div>
      )}

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

        {/*
          Only facts this institution actually has.
          A grid of four cards reading "Ask an advisor" tells the visitor
          nothing except that the page is empty; showing two real ones is a
          better page than four placeholders.
        */}
        {/* auto-fit, not a fixed four: the number of cards depends on what
            this institution actually has, and a fixed track leaves a visible
            hole in the row whenever that is three. */}
        <dl className="mt-8 grid gap-4 grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
          {(
            [
              institution.foundedYear && {
                icon: CalendarDays,
                label: 'Founded',
                value: String(institution.foundedYear),
              },
              institution.studentCount && {
                icon: Users,
                label: 'Students',
                value: institution.studentCount.toLocaleString('en-GB'),
              },
              courses.length > 0 && {
                icon: Building2,
                label: 'Courses listed',
                value: String(courses.length),
              },
              institution.upcomingIntake && {
                icon: GraduationCap,
                label: 'Upcoming intake',
                value: institution.upcomingIntake,
              },
              institution.tuitionFrom && {
                icon: Wallet,
                label: 'Tuition from',
                value: formatMoney({
                  amount: Number(institution.tuitionFrom),
                  currency: institution.tuitionCurrency ?? 'GBP',
                }),
              },
              (institution.englishTests ?? []).length > 0 && {
                icon: Award,
                label: 'English accepted',
                value: (institution.englishTests ?? []).map((test) => test.test).join(', '),
              },
              host && {
                icon: Globe2,
                label: 'Official site',
                value: host,
              },
            ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[]
          )
            .slice(0, 4)
            .map((fact) => (
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

        {/*
          Two columns: the overview reads at a normal measure and the
          highlights sit beside it rather than under it, which is what stops
          the band being one short line across a 1,200px page.
        */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            {overviewParagraphs.length > 0 ? (
              <>
                {overviewParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mb-4 text-base text-text">
                    {paragraph}
                  </p>
                ))}

                {/* Required by the licence, not decoration. */}
                {institution.overviewSourceUrl && (
                  <p className="mt-6 text-sm text-text-muted">
                    Overview adapted from{' '}
                    <a
                      href={institution.overviewSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                    >
                      Wikipedia
                    </a>
                    , available under CC BY-SA.
                  </p>
                )}
              </>
            ) : (
              <p className="text-base text-text-muted">
                {about ??
                  `We are still writing up ${institution.name}. Our advisors know it — ask them anything about entry requirements, fees or the application, and they will answer from experience rather than a brochure.`}
              </p>
            )}
          </div>

          {(institution.highlights ?? []).length > 0 && (
            <aside aria-labelledby="university-highlights-heading">
              <h3
                id="university-highlights-heading"
                className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted"
              >
                Highlights
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {(institution.highlights ?? []).map((line) => (
                  <li
                    key={line}
                    className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {(institution.qualityRatings ?? []).length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-3">
            {(institution.qualityRatings ?? []).map((rating) => (
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

        {(institution.highlights ?? []).length > 0 && (
          <>
            <h3 className="mt-10 font-heading text-lg font-semibold text-text">Highlights</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {(institution.highlights ?? []).map((highlight) => (
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

      {/*
        Hidden entirely for imported records rather than shown empty. A
        "Required documents" heading with nothing under it does not read as
        "we have not filled this in" — it reads as "no documents required",
        which is the opposite of true.
      */}
      {hasApplicationDetail && (
      <SectionBand labelledBy={docsBandLabel}>
        {(institution.requiredDocuments ?? []).length > 0 && (
        <>
        <h2 id="university-docs-heading" className="font-heading text-2xl font-bold text-text">
          Required documents
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          {(institution.requiredDocuments ?? []).map((group) => (
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
        </>
        )}

        {institution.employability && (
          <>
            <h2
              id="university-employability-heading"
              className="mt-12 font-heading text-2xl font-bold text-text"
            >
              Employability
            </h2>
            <p className="mt-4 max-w-prose text-base text-text-muted">
              {institution.employability}
            </p>
          </>
        )}

        {(institution.faqs ?? []).length > 0 && (
          <>
            <h2
              id="university-faqs-heading"
              className="mt-12 font-heading text-2xl font-bold text-text"
            >
              Frequently asked questions
            </h2>
            <dl className="mt-6 flex flex-col gap-4">
              {(institution.faqs ?? []).map((faq) => (
                <div key={faq.question} className="rounded-lg border border-border bg-surface p-5">
                  <dt className="font-heading text-base font-semibold text-text">{faq.question}</dt>
                  <dd className="mt-2 text-base text-text-muted">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </SectionBand>
      )}

      {guidance.items.length > 0 && (
        <SectionBand tone="surface" labelledBy="university-guidance-heading">
          <h2
            id="university-guidance-heading"
            className="font-heading text-2xl font-bold text-text"
          >
            Applying to {institution.country}
          </h2>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            What the process looks like, and where applicants lose time.
          </p>

          <ul className="mt-6 grid items-stretch gap-4 sm:grid-cols-3">
            {guidance.items.map((entry) => (
              <li key={entry.id} className="h-full">
                <a
                  href={articleRoute(entry.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-bg p-6 transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  {entry.readMinutes && (
                    <span className="text-sm text-text-muted">{entry.readMinutes} min read</span>
                  )}
                  <h3 className="mt-2 font-heading text-base font-semibold text-text">
                    {entry.title}
                  </h3>
                  {entry.excerpt && (
                    <p className="mt-2 flex-1 text-sm text-text-muted">{entry.excerpt}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      {neighbours.length > 0 && (
        <SectionBand labelledBy="university-nearby-heading">
          <h2 id="university-nearby-heading" className="font-heading text-2xl font-bold text-text">
            {institution.city
              ? `Other universities in ${institution.city}`
              : `More universities in ${institution.country}`}
          </h2>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Most applicants apply to several. These are the closest alternatives we hold.
          </p>

          <ul className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {neighbours.map((entry) => (
              <li key={entry.id} className="h-full">
                <a
                  href={universityRoute(entry.slug)}
                  className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <CountryFlag countryCode={entry.countryCode} size="sm" />
                    {formatLocation(entry.city, entry.country)}
                  </span>
                  <h3 className="mt-2 font-heading text-base font-semibold text-text">
                    {entry.name}
                  </h3>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-text-muted">
            <a
              href={`${ROUTES.universities}?country=${institution.countryCode}`}
              className="rounded-sm text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              Browse every university in {institution.country}
            </a>
          </p>
        </SectionBand>
      )}

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
