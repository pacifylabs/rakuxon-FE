import { AppLink, SectionBand, TestimonialGrid } from '@rakuxon/ui';
import type { GridTestimonial } from '@rakuxon/ui';

import { ROUTES } from '@/content/routes';
import { fetchTestimonials } from '@/lib/testimonials/api';

/**
 * The students-page testimonial section — same admin-authored source as
 * `Testimonials` (the homepage one), filtered to the `students` placement
 * instead of `home`. Kept as its own small async Server Component, same as
 * `Testimonials`/`DestinationCounts`/`PopularDestinations`, so the page
 * itself stays a plain synchronous function.
 */
export async function StudentTestimonials() {
  const testimonials = await fetchTestimonials('students');
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
    <SectionBand labelledBy="students-testimonials-heading">
      <h2
        id="students-testimonials-heading"
        className="text-center font-heading text-2xl font-bold text-text md:text-3xl"
      >
        Students who have been through it
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
