import type { Metadata } from 'next';

import { CtaBand, DestinationCard, PageHeader, SectionBand } from '@rakuxon/ui';

import { COUNTRIES, DESTINATIONS_CTA, DESTINATIONS_INDEX } from '@/content/destinations';
import { countryRoute } from '@/content/routes';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Study destinations',
  description:
    'Compare the UK, Canada, the US, Ireland, Australia and Germany on cost, course length, intakes and post-study work rights.',
};

export default function DestinationsPage() {
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
          {COUNTRIES.map((country) => (
            <li key={country.slug} className="h-full">
              <DestinationCard
                country={country.shortName}
                href={countryRoute(country.slug)}
                src={country.cardImage.src}
                alt={country.cardImage.alt}
                description={country.tagline}
              />
            </li>
          ))}
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
