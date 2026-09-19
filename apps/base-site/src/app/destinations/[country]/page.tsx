import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Breadcrumbs,
  CtaBand,
  FactGrid,
  ImageHero,
  SectionBand,
  UniversityCard,
} from '@rakuxon/ui';

import { DESTINATIONS_CTA, DESTINATION_FALLBACK_IMAGE } from '@/content/destinations';
import { ROUTES, SIGN_UP } from '@/content/routes';
import { UNIVERSITIES } from '@/content/universities';
import { fetchDestinationGuide } from '@/lib/destinations/api';
import { absoluteUrl } from '@/lib/site-url';

/* Revalidated: a guide can be edited and republished from the admin CMS at
   any time — see content/destinations.ts's own note on this. */
export const revalidate = 300;

type Params = { params: Promise<{ country: string }> };

function countryHref(slug: string): string {
  return `/destinations/${slug}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { country: slug } = await params;
  const guide = await fetchDestinationGuide(slug);
  if (!guide) return {};

  return {
    title: `Study in ${guide.shortName}`,
    description: guide.intro,
    alternates: { canonical: countryHref(slug) },
  };
}

export default async function CountryPage({ params }: Params) {
  const { country: slug } = await params;
  const guide = await fetchDestinationGuide(slug);
  if (!guide) notFound();

  /* Campus cards for the illustrative institutions named on this guide. */
  const universities = UNIVERSITIES.filter((university) => guide.universities.includes(university.name));

  const heroImage = guide.heroImageUrl
    ? { src: guide.heroImageUrl, alt: guide.heroImageAlt }
    : guide.cardImageUrl
      ? { src: guide.cardImageUrl, alt: guide.cardImageAlt }
      : DESTINATION_FALLBACK_IMAGE;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Destinations', item: absoluteUrl(ROUTES.destinations) },
              {
                '@type': 'ListItem',
                position: 2,
                name: guide.shortName,
                item: absoluteUrl(countryHref(slug)),
              },
            ],
          }),
        }}
      />
      <ImageHero
        eyebrow="Study destination"
        title={`Study in ${guide.shortName}`}
        titleId="country-heading"
        subcopy={guide.intro}
        primaryCta={{ label: 'Get a shortlist', href: SIGN_UP }}
        secondaryCta={{ label: 'All destinations', href: ROUTES.destinations }}
        image={heroImage}
      >
        <Breadcrumbs
          trail={[{ label: 'Destinations', href: ROUTES.destinations }]}
          current={guide.shortName}
        />
      </ImageHero>

      <SectionBand tone="muted" labelledBy="country-why-heading">
        <h2
          id="country-why-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          {guide.whyHeading}
        </h2>
        <p className="mt-4 max-w-prose text-base text-text-muted">{guide.why}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {guide.whyPoints.map((point) => (
            <li
              key={point}
              className="rounded-lg border border-border bg-surface p-5 text-sm text-text shadow-sm"
            >
              {point}
            </li>
          ))}
        </ul>
      </SectionBand>

      <SectionBand labelledBy="country-facts-heading">
        <h2
          id="country-facts-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Costs, intakes and timing
        </h2>
        <p className="mt-4 max-w-prose text-base text-text-muted">
          Indicative public ranges to help you plan. They are not quotes: your actual cost depends
          on the institution, the city and the course.
        </p>
        <FactGrid className="mt-10" facts={guide.facts} columns={3} sample />
      </SectionBand>

      {universities.length > 0 && (
        <SectionBand tone="muted" labelledBy="country-universities-heading">
          <h2
            id="country-universities-heading"
            className="font-heading text-2xl font-bold text-text md:text-3xl"
          >
            Popular institutions in {guide.shortName}
          </h2>
          <ul
            data-sample="true"
            className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {universities.map((university) => (
              <li key={university.name} className="h-full">
                <UniversityCard
                  name={university.name}
                  country={guide.shortName}
                  src={university.src}
                  alt={university.alt}
                  href={ROUTES.universities}
                />
              </li>
            ))}
          </ul>
        </SectionBand>
      )}

      <SectionBand labelledBy="country-help-heading">
        <h2
          id="country-help-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          How Rakuxon helps with {guide.shortName} applications
        </h2>
        <ol className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
          {guide.helpPoints.map((point, index) => (
            <li key={point} className="rounded-lg border border-border bg-surface p-6 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-base font-bold text-on-primary">
                {index + 1}
              </span>
              <p className="mt-4 text-sm text-text">{point}</p>
            </li>
          ))}
        </ol>
      </SectionBand>

      <SectionBand tone="surface" labelledBy="country-cta-heading">
        <CtaBand
          headingId="country-cta-heading"
          heading={`Ready to apply to ${guide.shortName}?`}
          subline={DESTINATIONS_CTA.subline}
          cta={DESTINATIONS_CTA.cta}
          reassurance={DESTINATIONS_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
