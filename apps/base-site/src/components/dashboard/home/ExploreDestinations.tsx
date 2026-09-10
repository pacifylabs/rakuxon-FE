import { DestinationCard } from '@rakuxon/ui';
import type { CountryCount } from '@rakuxon/contract';

import { destinationCardContent } from '@/content/destinations';
import { ROUTES } from '@/content/routes';

/** Most universities first — the destinations a student is likeliest to find something in. */
const MAX_SHOWN = 6;

export function ExploreDestinations({ destinations }: { destinations: CountryCount[] }) {
  const top = [...destinations]
    .sort((a, b) => b.institutions - a.institutions)
    .slice(0, MAX_SHOWN);

  if (top.length === 0) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-lg font-semibold text-text">
          Explore popular study destinations
        </h2>
        <a href={ROUTES.destinations} className="text-sm font-semibold text-primary underline">
          See all
        </a>
      </div>

      <ul className="mt-4 grid grid-cols-2 items-stretch gap-4 lg:grid-cols-3">
        {top.map((entry) => (
          <li key={entry.countryCode} className="h-full">
            <DestinationCard {...destinationCardContent(entry)} countryCode={entry.countryCode} />
          </li>
        ))}
      </ul>
    </div>
  );
}
