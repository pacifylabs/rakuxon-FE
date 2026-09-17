import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import TestimonialsPage from './page';

function stubApi(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => body }) as unknown as Response),
  );
}

const renderTestimonials = async () => renderPage(await TestimonialsPage());

afterEach(() => vi.unstubAllGlobals());

describe('/testimonials', () => {
  it('renders exactly one h1', async () => {
    stubApi([]);
    await renderTestimonials();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('lists every published testimonial, with no placement filter', async () => {
    stubApi([
      {
        id: 't1',
        quote: 'Rakuxon made it happen.',
        authorName: 'Amara',
        detail: 'NG → CA',
        photoUrl: null,
      },
      {
        id: 't2',
        quote: 'Applied without the chaos.',
        authorName: 'Daniel',
        detail: 'KE → UK',
        photoUrl: null,
      },
    ]);
    await renderTestimonials();

    expect(screen.getByText('Rakuxon made it happen.')).toBeInTheDocument();
    expect(screen.getByText('Applied without the chaos.')).toBeInTheDocument();
  });

  it('explains an empty list rather than showing a blank grid', async () => {
    stubApi([]);
    await renderTestimonials();

    expect(screen.getByText('No reviews published yet')).toBeInTheDocument();
  });

  it('still renders a page when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    await renderTestimonials();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('No reviews published yet')).toBeInTheDocument();
  });
});
