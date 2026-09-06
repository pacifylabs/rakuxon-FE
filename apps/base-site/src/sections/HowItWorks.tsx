import { SectionBand, StepItem } from '@rakuxon/ui';

import { STEPS } from '@/content/home';

/** docs/04b § 3.5 — mirrors the real product flow. */
export function HowItWorks() {
  return (
    <SectionBand id="how-it-works" labelledBy="how-it-works-heading">
      <h2
        id="how-it-works-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        How it works
      </h2>
      <p className="mx-auto mt-4 max-w-prose text-center text-base text-text-muted">
        Three steps from first idea to a decision letter.
      </p>

      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <StepItem
            key={step.title}
            step={index + 1}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </ol>
    </SectionBand>
  );
}
