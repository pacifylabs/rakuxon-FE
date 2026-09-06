import { DestinationCard, Reveal, SectionBand } from '@rakuxon/ui';

import { DESTINATIONS } from '@/content/home';

/** docs/04b § 3.6 — six country cards linking to the destination pages. */
export function PopularDestinations() {
  return (
    <SectionBand tone="muted" id="destinations" labelledBy="destinations-heading">
      <h2
        id="destinations-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Popular destinations
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Explore where students like you are heading, and what it takes to get there.
      </p>

      <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DESTINATIONS.map((destination, index) => (
          <li key={destination.country} className="h-full">
            <Reveal delay={index * 70}>
              <DestinationCard
                country={destination.country}
                href={destination.href}
                src={destination.src}
                alt={destination.alt}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
