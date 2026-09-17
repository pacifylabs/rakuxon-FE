import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TestimonialGrid } from './TestimonialGrid';

const TESTIMONIALS = [
  { id: 't1', quote: 'First quote.', name: 'Amara', detail: 'NG to CA' },
  { id: 't2', quote: 'Second quote.', name: 'Daniel', detail: 'KE to UK' },
  { id: 't3', quote: 'Third quote.', name: 'Mei', detail: 'CN to IE' },
];

describe('<TestimonialGrid/>', () => {
  it('renders every testimonial exactly once, with no duplicate loop copy', () => {
    render(<TestimonialGrid testimonials={TESTIMONIALS} />);
    for (const testimonial of TESTIMONIALS) {
      expect(screen.getByText(testimonial.quote)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('listitem')).toHaveLength(TESTIMONIALS.length);
  });

  it('has no motion of its own — a plain grid, not an animated track', () => {
    const { container } = render(<TestimonialGrid testimonials={TESTIMONIALS} />);
    expect(container.querySelector('.animate-marquee')).not.toBeInTheDocument();
    expect(container.querySelector('ul')).toHaveClass('grid');
  });

  it('renders nothing when there is nothing to show', () => {
    const { container } = render(<TestimonialGrid testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
