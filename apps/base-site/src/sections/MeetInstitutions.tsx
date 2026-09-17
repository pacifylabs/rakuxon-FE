import { SectionBand, UniversityCard } from '@rakuxon/ui';

import { fetchInstitutions } from '@/lib/catalogue/api';

/**
 * docs/04b § 3.7 — campus cards.
 *
 * Used to be three fictional sample-bank institutions ("Northfield
 * University" and friends) shown to visitors as if they were real. Now reads
 * whichever real institutions an admin has featured, each needing a real
 * `heroImageUrl` — UniversityCard's photo is not optional, and inventing one
 * for a real institution would be the same misrepresentation the fictional
 * placeholders already were. An institution an admin features without
 * Wikidata photo coverage simply will not appear here until it has one.
 */
export async function MeetInstitutions() {
  const { items } = await fetchInstitutions({ featured: true, limit: 6 });
  const withPhotos = items.filter(
    (institution): institution is typeof institution & { heroImageUrl: string } =>
      Boolean(institution.heroImageUrl),
  );

  if (withPhotos.length === 0) return null;

  return (
    <SectionBand id="institutions" labelledBy="institutions-heading">
      <h2
        id="institutions-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Explore leading institutions
      </h2>

      <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {withPhotos.map((institution) => (
          <li key={institution.id} className="h-full">
            <UniversityCard
              name={institution.name}
              country={institution.country}
              src={institution.heroImageUrl}
              alt={`${institution.name} campus`}
            />
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
