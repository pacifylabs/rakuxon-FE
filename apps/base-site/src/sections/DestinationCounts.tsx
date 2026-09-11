import { CountryFlag, CountUp, Reveal, SectionBand } from '@rakuxon/ui';

import { fetchCountryCounts } from '@/lib/catalogue/institutions';
import { ROUTES } from '@/content/routes';

/**
 * Live institution counts per destination, from the open Research Organization
 * Registry. Renders nothing if the registry is unreachable — a marketing page
 * should not show an error where a number was promised.
 */
export async function DestinationCounts() {
  const counts = await fetchCountryCounts();
  if (counts.error || counts.items.length === 0) return null;

  return (
    <SectionBand tone="muted" labelledBy="counts-heading">
      <h2
        id="counts-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        How many institutions are out there
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Registered education organisations per destination, counted live from the open Research
        Organization Registry. Not a number we made up.
      </p>

      <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {counts.items.map((entry, index) => (
          <li key={entry.countryCode} className="h-full">
            <Reveal delay={index * 60}>
              <a
                href={`${ROUTES.explore}?tab=universities&country=${entry.countryCode}`}
                className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-center gap-4">
                  <CountryFlag countryCode={entry.countryCode} size="lg" />
                  <div>
                    <p className="font-heading text-2xl font-bold text-text">
                      <CountUp value={entry.institutions.toLocaleString('en-GB')} />
                    </p>
                    <p className="mt-1 text-sm text-text-muted">{entry.country}</p>
                  </div>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-primary">
                  Browse {entry.country}
                  <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
