import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

import { MeetInstitutions } from './MeetInstitutions';

afterEach(() => vi.unstubAllGlobals());

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

const page = (items: unknown[]) => ({ items, total: items.length, page: 1, pageCount: 1 });

async function renderInstitutions() {
  const element = await MeetInstitutions();
  return render(<ThemeProvider>{element}</ThemeProvider>);
}

describe('<MeetInstitutions/>', () => {
  it('renders a featured institution that has a hero image', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        ok(
          page([
            {
              id: 'i1',
              slug: 'real-university',
              name: 'Real University',
              country: 'United Kingdom',
              heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Real.jpg',
            },
          ]),
        ),
      ),
    );

    await renderInstitutions();

    expect(screen.getByRole('heading', { name: 'Real University' })).toBeInTheDocument();
  });

  it('skips a featured institution with no hero image, rather than a broken card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        ok(
          page([
            { id: 'i1', slug: 'no-photo-university', name: 'No Photo University', country: 'Ghana' },
          ]),
        ),
      ),
    );

    await renderInstitutions();

    expect(screen.queryByText('No Photo University')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Explore leading institutions' })).not.toBeInTheDocument();
  });

  it('renders nothing when no institution is featured', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok(page([]))));

    await renderInstitutions();

    expect(screen.queryByRole('heading', { name: 'Explore leading institutions' })).not.toBeInTheDocument();
  });
});
