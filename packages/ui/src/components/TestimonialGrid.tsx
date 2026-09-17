import clsx from 'clsx';

import { TestimonialCard } from './TestimonialCard';

export interface GridTestimonial {
  id: string;
  quote: string;
  name: string;
  detail: string;
  /** Omit for a real, named client who has not supplied a photograph. */
  src?: string;
  alt?: string;
}

export interface TestimonialGridProps {
  testimonials: readonly GridTestimonial[];
  className?: string;
}

/**
 * A calm, static alternative to a continuously scrolling strip — one column
 * on mobile, up to three across on desktop. No motion of its own; a card
 * simply sits where it is.
 */
export function TestimonialGrid({ testimonials, className }: TestimonialGridProps) {
  if (testimonials.length === 0) return null;

  return (
    <ul className={clsx('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {testimonials.map((testimonial) => (
        <li key={testimonial.id}>
          <TestimonialCard
            quote={testimonial.quote}
            name={testimonial.name}
            detail={testimonial.detail}
            src={testimonial.src}
            alt={testimonial.alt}
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
