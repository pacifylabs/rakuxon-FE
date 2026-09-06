import { CapabilityCard, EyebrowPill, Reveal, SectionBand } from '@rakuxon/ui';

import { CAPABILITIES } from '@/content/home';

/** docs/04b § 3.3 — "Everything you need" four-card grid. */
export function CapabilityGrid() {
  return (
    <SectionBand id="capabilities" labelledBy="capabilities-heading" className="pt-20">
      <div className="flex flex-col items-center text-center">
        <EyebrowPill>Everything you need</EyebrowPill>
        <h2
          id="capabilities-heading"
          className="mt-6 font-heading text-2xl font-bold text-text md:text-3xl"
        >
          Your study abroad journey, simplified.
        </h2>
      </div>

      <ul className="mt-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((capability, index) => (
          <li key={capability.title} className="h-full">
            <Reveal delay={index * 70}>
              <CapabilityCard
                icon={capability.icon}
                tone={capability.tone}
                title={capability.title}
                description={capability.description}
                action={capability.action}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
