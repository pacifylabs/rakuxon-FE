import { Reveal, SectionBand, UniversityCard } from '@rakuxon/ui';

import { INSTITUTIONS } from '@/content/home';

/**
 * docs/04b § 3.7 — campus cards.
 *
 * Institution names are illustrative until real partners are signed, so the
 * list is marked `data-sample` rather than reading as a customer roster.
 */
export function MeetInstitutions() {
  return (
    <SectionBand id="institutions" labelledBy="institutions-heading">
      <h2
        id="institutions-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Explore leading institutions
      </h2>

      <ul
        data-sample="true"
        className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {INSTITUTIONS.map((institution, index) => (
          <li key={institution.name} className="h-full">
            <Reveal delay={index * 70}>
              <UniversityCard
                name={institution.name}
                country={institution.country}
                src={institution.src}
                alt={institution.alt}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
