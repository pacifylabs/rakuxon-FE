import { SectionBand, TestimonialMarquee } from '@rakuxon/ui';

import { TESTIMONIALS } from '@/content/home';

/** docs/04b § 3.8 — student quotes, scrolling continuously. */
export function Testimonials() {
  return (
    <SectionBand tone="muted" labelledBy="testimonials-heading" innerClassName="max-w-none">
      <h2
        id="testimonials-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Students who found their path
      </h2>

      <TestimonialMarquee className="mt-12" testimonials={TESTIMONIALS} sample />
    </SectionBand>
  );
}
