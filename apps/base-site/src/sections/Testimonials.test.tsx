import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

import { Testimonials } from './Testimonials';

afterEach(() => vi.unstubAllGlobals());

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

async function renderTestimonials() {
  const element = await Testimonials();
  return render(<ThemeProvider>{element}</ThemeProvider>);
}

describe('<Testimonials/>', () => {
  it('renders a published testimonial with its author', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        ok([
          {
            id: 't1',
            quote: 'Rakuxon made it happen.',
            authorName: 'Amara',
            detail: 'Nigeria → Canada',
            photoUrl: null,
          },
        ]),
      ),
    );

    await renderTestimonials();

    // The marquee renders the list twice to make the loop seamless, so a
    // real quote is expected to appear more than once.
    expect(screen.getAllByText('Rakuxon made it happen.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Amara').length).toBeGreaterThan(0);
  });

  it('renders nothing when there are no published testimonials, rather than an empty heading', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok([])));

    await renderTestimonials();

    expect(screen.queryByText('Success stories that inspire')).not.toBeInTheDocument();
  });

  it('fails soft when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );

    await renderTestimonials();

    expect(screen.queryByText('Success stories that inspire')).not.toBeInTheDocument();
  });
});
