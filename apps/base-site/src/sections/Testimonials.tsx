import { AppLink, SectionBand, TestimonialGrid } from '@rakuxon/ui';
import type { GridTestimonial } from '@rakuxon/ui';

import { ROUTES } from '@/content/routes';
import { fetchTestimonials } from '@/lib/testimonials/api';

/**
 * docs/04b § 3.8 — real client quotes, admin-authored. Used to be a
 * hardcoded array; now the same content lives in the admin testimonials
 * screen, so a new one can be added without a deploy.
 *
 * Heading is rakuxon.com's own. It reads "Success stories" rather than
 * "Students who found their path" because not every testimonial here is a
 * student's — travel clients get quoted too, and calling them students would
 * be false.
 *
 * A static grid, not a scrolling strip — the full list lives at
 * `/testimonials`, one click away, rather than looping in place here.
 *
 * No photo unless the admin recorded consent for one (enforced by the API,
 * not just this component) — TestimonialGrid already renders initials when
 * there is none, so a mixed set of photo/no-photo cards is the normal case,
 * not a fallback to apologise for. An empty result hides the whole section
 * rather than showing nothing under a heading.
 */
export async function Testimonials() {
  const testimonials = await fetchTestimonials('home');
  if (testimonials.length === 0) return null;

  const cards: GridTestimonial[] = testimonials.map((testimonial) => ({
    id: testimonial.id,
    quote: testimonial.quote,
    name: testimonial.authorName,
    detail: testimonial.detail,
    src: testimonial.photoUrl ?? undefined,
    alt: testimonial.photoUrl ? `Portrait of ${testimonial.authorName}` : undefined,
  }));

  return (
    <SectionBand tone="muted" labelledBy="testimonials-heading">
      <h2
        id="testimonials-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Success stories that inspire
      </h2>

      <TestimonialGrid className="mt-12" testimonials={cards} />

      <div className="mt-8 flex justify-center">
        <AppLink
          href={ROUTES.testimonials}
          className="rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
        >
          See all reviews
        </AppLink>
      </div>
    </SectionBand>
  );
}
