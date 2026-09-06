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

import { COUNTRY_BY_SLUG, COUNTRIES, DESTINATIONS_CTA } from '@/content/destinations';
import { ROUTES, SIGN_UP } from '@/content/routes';
import type { CountrySlug } from '@/content/routes';
import { UNIVERSITIES } from '@/content/universities';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.slug }));
}

type Params = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { country: slug } = await params;
  const country = COUNTRY_BY_SLUG.get(slug as CountrySlug);
  if (!country) return {};

  return {
    title: `Study in ${country.shortName}`,
    description: country.intro,
  };
}

export default async function CountryPage({ params }: Params) {
  const { country: slug } = await params;
  const country = COUNTRY_BY_SLUG.get(slug as CountrySlug);
  if (!country) notFound();

  /* Campus cards for the illustrative institutions named on this country. */
  const universities = UNIVERSITIES.filter((university) =>
    country.universities.includes(university.name),
  );

  return (
    <>
      <ImageHero
        eyebrow="Study destination"
        title={`Study in ${country.shortName}`}
        titleId="country-heading"
        subcopy={country.intro}
        primaryCta={{ label: 'Get a shortlist', href: SIGN_UP }}
        secondaryCta={{ label: 'All destinations', href: ROUTES.destinations }}
        image={country.heroImage}
      >
        <Breadcrumbs
          trail={[{ label: 'Destinations', href: ROUTES.destinations }]}
          current={country.shortName}
        />
      </ImageHero>

      <SectionBand tone="muted" labelledBy="country-why-heading">
        <h2
          id="country-why-heading"
          className="font-heading text-2xl font-bold text-text md:text-3xl"
        >
          {country.whyHeading}
        </h2>
        <p className="mt-4 max-w-prose text-base text-text-muted">{country.why}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {country.whyPoints.map((point) => (
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
          Indicative public ranges to help you plan. They are not quotes — your actual cost depends
          on the institution, the city and the course.
        </p>
        <FactGrid className="mt-10" facts={country.facts} columns={3} sample />
      </SectionBand>

      {universities.length > 0 && (
        <SectionBand tone="muted" labelledBy="country-universities-heading">
          <h2
            id="country-universities-heading"
            className="font-heading text-2xl font-bold text-text md:text-3xl"
          >
            Popular institutions in {country.shortName}
          </h2>
          <ul
            data-sample="true"
            className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {universities.map((university) => (
              <li key={university.name} className="h-full">
                <UniversityCard
                  name={university.name}
                  country={country.shortName}
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
          How Rakuxon helps with {country.shortName} applications
        </h2>
        <ol className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
          {country.helpPoints.map((point, index) => (
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
          heading={`Ready to apply to ${country.shortName}?`}
          subline={DESTINATIONS_CTA.subline}
          cta={DESTINATIONS_CTA.cta}
          reassurance={DESTINATIONS_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
