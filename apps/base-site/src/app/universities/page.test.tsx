import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import UniversitiesPage from './page';

/**
 * The universities page became an async server component that reads the real
 * catalogue, so it cannot go through the synchronous page harness — it is
 * awaited here and its API stubbed instead.
 */
const countries = [{ countryCode: 'GB', country: 'United Kingdom', institutions: 456 }];

const institutions = {
  items: [
    {
      id: 'i1',
      slug: 'university-of-manchester',
      name: 'University of Manchester',
      aka: ['UoM'],
      country: 'United Kingdom',
      countryCode: 'GB',
      city: 'Manchester',
      fastTrackOffer: true,
      courseCount: 3,
    },
  ],
  total: 456,
  page: 1,
  pageCount: 19,
};

function stubApi(overrides: { institutions?: unknown; fail?: boolean } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (overrides.fail) throw new Error('down');
      const body = url.includes('/countries') ? countries : (overrides.institutions ?? institutions);
      return { ok: true, json: async () => body } as unknown as Response;
    }),
  );
}

const renderUniversities = async (params: Record<string, string> = {}) => {
  const element = await UniversitiesPage({ searchParams: Promise.resolve(params) });
  return renderPage(element);
};

afterEach(() => vi.unstubAllGlobals());

describe('/universities', () => {
  it('renders exactly one h1', async () => {
    stubApi();
    await renderUniversities();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('lists universities from the catalogue', async () => {
    stubApi();
    await renderUniversities();
    expect(screen.getByRole('link', { name: 'University of Manchester' })).toHaveAttribute(
      'href',
      '/universities/university-of-manchester',
    );
  });

  it('offers every destination with its live count', async () => {
    // A hard-coded menu drifts from the listing it sits beside; this one is
    // counted from the same published set.
    stubApi();
    await renderUniversities();
    expect(screen.getByRole('option', { name: 'United Kingdom (456)' })).toBeInTheDocument();
  });

  it('keeps filter state in the URL, so a filtered view is shareable', async () => {
    stubApi();
    const { container } = await renderUniversities({ country: 'GB', q: 'manchester' });

    const form = container.querySelector('form[method="get"]');
    expect(form).toHaveAttribute('action', '/universities');
    expect(screen.getByLabelText('Search universities')).toHaveValue('manchester');
  });

  it('pages with real links rather than buttons', async () => {
    // Buttons would need JavaScript and would break the back button; a page of
    // results should be shareable.
    stubApi({ institutions: { ...institutions, page: 2 } });
    await renderUniversities({ page: '2' });

    expect(screen.getByRole('link', { name: /Previous/ })).toHaveAttribute(
      'href',
      '/universities',
    );
    expect(screen.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      '/universities?page=3',
    );
  });

  it('says so when the catalogue is unreachable, instead of failing to render', async () => {
    stubApi({ fail: true });
    await renderUniversities();
    expect(screen.getByRole('status')).toHaveTextContent(/unavailable right now/i);
  });

  it('offers a way out of an empty result', async () => {
    stubApi({ institutions: { items: [], total: 0, page: 1, pageCount: 1 } });
    await renderUniversities({ q: 'zzzz' });
    expect(screen.getByRole('status')).toHaveTextContent(/No universities match/i);
    expect(screen.getByRole('link', { name: 'clear the filters' })).toBeInTheDocument();
  });
});
