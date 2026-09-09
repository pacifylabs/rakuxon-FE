import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import ResourcesPage from './page';

/**
 * An async server component reading the live catalogue, so it is awaited here
 * and its API stubbed rather than going through the synchronous harness.
 */
const countries = [
  { countryCode: 'GB', country: 'United Kingdom', institutions: 456 },
  { countryCode: 'CA', country: 'Canada', institutions: 120 },
  { countryCode: 'JP', country: 'Japan', institutions: 40 },
];

const articles = {
  items: [
    {
      id: 'a1',
      slug: 'uk-student-visa-order-of-events',
      title: 'The UK student route, in the order things actually happen',
      excerpt: 'The steps have dependencies.',
      countryCode: 'GB',
      tags: ['visas', 'united-kingdom'],
      readMinutes: 7,
      author: 'Rakuxon Editorial',
      publishedAt: '2026-02-25T00:00:00.000Z',
    },
    {
      id: 'a2',
      slug: 'how-to-choose-a-university-abroad',
      title: 'How to choose a university abroad',
      excerpt: 'Rankings answer a question you are not asking.',
      tags: ['choosing'],
      readMinutes: 7,
      author: 'Rakuxon Editorial',
      publishedAt: '2026-01-14T00:00:00.000Z',
    },
  ],
  total: 2,
  page: 1,
  pageCount: 1,
  tags: ['choosing', 'united-kingdom', 'visas'],
};

function stubApi(overrides: { articles?: unknown; fail?: boolean } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (overrides.fail) throw new Error('down');
      const body = url.includes('/countries') ? countries : (overrides.articles ?? articles);
      return { ok: true, json: async () => body } as unknown as Response;
    }),
  );
}

const renderResources = async (params: Record<string, string> = {}) => {
  const element = await ResourcesPage({ searchParams: Promise.resolve(params) });
  return renderPage(element);
};

afterEach(() => vi.unstubAllGlobals());

describe('/resources', () => {
  it('renders exactly one h1', async () => {
    stubApi();
    await renderResources();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('links each article to its own page', async () => {
    stubApi();
    await renderResources();

    expect(
      screen.getByRole('link', { name: /the uk student route/i }),
    ).toHaveAttribute('href', '/resources/uk-student-visa-order-of-events');
  });

  it('offers every published tag, including ones absent from this page', async () => {
    // The tag list comes from the API's whole-set query, not from the visible
    // rows — otherwise filtering removes the filters.
    stubApi();
    const { container } = await renderResources();
    const filters = within(container).getByRole('navigation', { name: /filter guidance/i });

    for (const label of ['Choosing', 'United kingdom', 'Visas']) {
      expect(within(filters).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('offers only destinations that actually have guidance', async () => {
    // Japan is in the catalogue and has no articles. Offering it is a dead end
    // that returns an empty page.
    stubApi();
    const { container } = await renderResources();
    const filters = within(container).getByRole('navigation', { name: /filter guidance/i });

    const hrefs = within(filters)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/resources?country=GB');
    expect(hrefs).not.toContain('/resources?country=JP');
  });

  it('marks the active tag and lets it be cleared by clicking again', async () => {
    stubApi();
    const { container } = await renderResources({ tag: 'visas' });
    const filters = within(container).getByRole('navigation', { name: /filter guidance/i });
    const active = within(filters).getByRole('link', { name: 'Visas' });

    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveAttribute('href', '/resources');
  });

  it('keeps filters in the URL so a filtered view is shareable', async () => {
    stubApi();
    const { container } = await renderResources();
    const filters = within(container).getByRole('navigation', { name: /filter guidance/i });

    expect(within(filters).getByRole('link', { name: 'Visas' })).toHaveAttribute(
      'href',
      '/resources?tag=visas',
    );
  });

  it('carries the filter into the pager, so page two keeps the same filter', async () => {
    stubApi({
      articles: { ...articles, page: 1, pageCount: 3, total: 30 },
    });
    const { container } = await renderResources({ tag: 'visas' });
    const pager = within(container).getByRole('navigation', { name: 'Pagination' });

    expect(within(pager).getByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/resources?tag=visas&page=2',
    );
  });

  it('hides the pager when everything fits on one page', async () => {
    stubApi();
    const { container } = await renderResources();
    expect(within(container).queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  });

  it('explains an empty filter rather than showing a blank grid', async () => {
    stubApi({ articles: { items: [], total: 0, page: 1, pageCount: 1, tags: ['visas'] } });
    await renderResources({ tag: 'visas' });

    expect(screen.getByText(/nothing under that filter yet/i)).toBeInTheDocument();
  });

  it('still renders when the catalogue is down', async () => {
    // A marketing page has to survive its API. An empty library with a message
    // is a degraded page; a thrown error is no page at all.
    stubApi({ fail: true });
    await renderResources();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/guidance is unavailable right now/i)).toBeInTheDocument();
    expect(screen.getByText(/the catalogue is unavailable right now/i)).toBeInTheDocument();
  });
});
