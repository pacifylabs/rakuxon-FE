import { SectionBand, TestimonialMarquee } from '@rakuxon/ui';

import { TESTIMONIALS } from '@/content/home';

/**
 * docs/04b § 3.8 — real client quotes from rakuxon.com, scrolling continuously.
 *
 * Heading is rakuxon.com's own. The previous "Students who found their path"
 * no longer fitted: two of the six are travel clients — a honeymoon and a solo
 * Europe tour — and calling them students would be false.
 *
 * `sample` is gone. These are real, attributable people, so flagging them as
 * sample data would be the lie now.
 */
export function Testimonials() {
  return (
    <SectionBand tone="muted" labelledBy="testimonials-heading" innerClassName="max-w-none">
      <h2
        id="testimonials-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Success stories that inspire
      </h2>

      <TestimonialMarquee className="mt-12" testimonials={TESTIMONIALS} />
    </SectionBand>
  );
}
