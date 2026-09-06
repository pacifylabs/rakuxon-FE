import { AudienceCard, Reveal, SectionBand } from '@rakuxon/ui';

import { AUDIENCES } from '@/content/home';

/** docs/04b § 3.9 — "Start your journey with us", three audiences. */
export function AudienceSplit() {
  return (
    <SectionBand id="audiences" labelledBy="audiences-heading">
      <h2
        id="audiences-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Start your journey with us
      </h2>

      <ul className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
        {AUDIENCES.map((audience, index) => (
          <li key={audience.title} className="h-full">
            <Reveal delay={index * 70}>
              <AudienceCard
                title={audience.title}
                description={audience.description}
                cta={audience.cta}
                src={audience.src}
                alt={audience.alt}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
