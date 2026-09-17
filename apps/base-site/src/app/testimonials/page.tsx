import { MessageSquareQuote } from 'lucide-react';
import type { Metadata } from 'next';

import { EmptyState, PageHeader, SectionBand, TestimonialGrid } from '@rakuxon/ui';
import type { GridTestimonial } from '@rakuxon/ui';

import { ROUTES } from '@/content/routes';
import { TESTIMONIALS_EMPTY, TESTIMONIALS_HEADER } from '@/content/testimonials-page';
import { fetchTestimonials } from '@/lib/testimonials/api';

/* Revalidated rather than static: a newly published testimonial should show
   up here without a redeploy. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: TESTIMONIALS_HEADER.eyebrow,
  description: TESTIMONIALS_HEADER.subcopy,
  alternates: { canonical: ROUTES.testimonials },
};

export default async function TestimonialsPage() {
  /* No placement filter — this page is the full list every section's "See
     all reviews" link points to. 24 is the API's own cap
     (`ListTestimonialsQueryDto`), comfortably above what's published today. */
  const testimonials = await fetchTestimonials(undefined, 24);

  const cards: GridTestimonial[] = testimonials.map((testimonial) => ({
    id: testimonial.id,
    quote: testimonial.quote,
    name: testimonial.authorName,
    detail: testimonial.detail,
    src: testimonial.photoUrl ?? undefined,
    alt: testimonial.photoUrl ? `Portrait of ${testimonial.authorName}` : undefined,
  }));

  return (
    <>
      <PageHeader
        eyebrow={TESTIMONIALS_HEADER.eyebrow}
        title={TESTIMONIALS_HEADER.title}
        titleId="testimonials-heading"
        subcopy={TESTIMONIALS_HEADER.subcopy}
      />

      <SectionBand labelledBy="testimonials-heading">
        {cards.length > 0 ? (
          <TestimonialGrid testimonials={cards} />
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title={TESTIMONIALS_EMPTY.title}
            description={TESTIMONIALS_EMPTY.description}
          />
        )}
      </SectionBand>
    </>
  );
}
