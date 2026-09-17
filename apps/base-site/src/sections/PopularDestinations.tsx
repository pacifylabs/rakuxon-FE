import { DestinationCard, SectionBand } from '@rakuxon/ui';

import { DESTINATIONS } from '@/content/home';
import { fetchCountries } from '@/lib/catalogue/api';

/**
 * docs/04b § 3.6 — country cards linking to the destination pages.
 *
 * Membership and order are admin-set (Countries screen, "Homepage position")
 * rather than a fixed six, and counts come from Rakuxon's own catalogue
 * instead of the external ror.org registry this used to call — one fewer
 * runtime dependency, and a count that always agrees with what publishing
 * actually changed.
 *
 * The photography stays curated in `DESTINATIONS` rather than becoming
 * admin-uploaded: there is no image-hosting path in this product for
 * marketing photos (Cloudinary here is document uploads only), so a country
 * an admin features without a matching curated photo simply does not appear
 * — the same "only show what we actually have" rule the rest of the
 * catalogue follows.
 */
export async function PopularDestinations() {
  const featured = await fetchCountries({ featured: true });
  const imageByCountry = new Map(
    DESTINATIONS.map((destination) => [destination.country, destination]),
  );

  const cards = featured
    .map((entry) => {
      const image = imageByCountry.get(entry.country);
      return image ? { ...image, count: entry.institutions } : null;
    })
    .filter((card): card is NonNullable<typeof card> => card !== null);

  if (cards.length === 0) return null;

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
        {cards.map((card) => (
          <li key={card.country} className="h-full">
            <DestinationCard
              country={card.country}
              href={card.href}
              src={card.src}
              alt={card.alt}
              description={
                card.count
                  ? `${card.count.toLocaleString('en-GB')} universit${card.count === 1 ? 'y' : 'ies'} in the catalogue.`
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
