import type { Metadata } from 'next';

import { CtaBand, DestinationCard, PageHeader, SectionBand } from '@rakuxon/ui';

import { COUNTRIES, DESTINATIONS_CTA, DESTINATIONS_INDEX } from '@/content/destinations';
import { ROUTES, countryRoute } from '@/content/routes';
import { fetchCountries } from '@/lib/catalogue/api';
import type { CountrySlug } from '@/content/routes';

/* Revalidated: the destination list is now whatever the catalogue holds. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Study destinations',
  description:
    'Compare the UK, Canada, the US, Ireland, Australia and Germany on cost, course length, intakes and post-study work rights.',
};

/** Written guides exist for six countries; the rest link to the filtered list. */
const GUIDE_BY_CODE: Record<string, CountrySlug> = {
  GB: 'uk',
  CA: 'canada',
  US: 'usa',
  IE: 'ireland',
  AU: 'australia',
  DE: 'germany',
};

const CARD_IMAGE_BY_CODE = new Map(
  COUNTRIES.map((country) => [country.slug, country] as const),
);

export default async function DestinationsPage() {
  /*
   * Every country the catalogue actually holds, not a hand-written six.
   *
   * The list used to be a constant, so the menu offered destinations with
   * nothing behind them and hid the fourteen that did. Countries with a
   * written guide link to it; the rest open the listing filtered to them,
   * which is a real page rather than a stub.
   */
  const countries = await fetchCountries();

  return (
    <>
      <PageHeader
        eyebrow={DESTINATIONS_INDEX.eyebrow}
        title={DESTINATIONS_INDEX.title}
        titleId="destinations-heading"
        subcopy={DESTINATIONS_INDEX.subcopy}
      />

      <SectionBand labelledBy="destinations-grid-heading">
        <h2 id="destinations-grid-heading" className="sr-only">
          All destinations
        </h2>

        <ul className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((entry) => {
            const guide = GUIDE_BY_CODE[entry.countryCode];
            const written = guide ? CARD_IMAGE_BY_CODE.get(guide) : undefined;

            return (
              <li key={entry.countryCode} className="h-full">
                <DestinationCard
                  country={written?.shortName ?? entry.country}
                  href={
                    guide
                      ? countryRoute(guide)
                      : `${ROUTES.universities}?country=${entry.countryCode}`
                  }
                  src={written?.cardImage.src}
                  alt={written?.cardImage.alt}
                  countryCode={entry.countryCode}
                  description={
                    written?.tagline ??
                    `${entry.institutions.toLocaleString('en-GB')} universities in the catalogue.`
                  }
                />
              </li>
            );
          })}
        </ul>
      </SectionBand>

      <SectionBand tone="surface" labelledBy="destinations-cta-heading">
        <CtaBand
          headingId="destinations-cta-heading"
          heading={DESTINATIONS_CTA.heading}
          subline={DESTINATIONS_CTA.subline}
          cta={DESTINATIONS_CTA.cta}
          reassurance={DESTINATIONS_CTA.reassurance}
        />
      </SectionBand>
    </>
  );
}
