import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import ServicesPage from './page';

function stubApi(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => body }) as unknown as Response),
  );
}

const renderServices = async () => renderPage(await ServicesPage());

const apiService = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 's1',
  slug: 'free-consultancy',
  iconName: 'Compass',
  title: 'Free Educational Consultancy',
  summary: 'Where every journey starts, at no cost.',
  description: 'Complimentary expert guidance.',
  strand: 'education',
  metaTitle: 'Free Study Abroad Consultation',
  metaDescription: 'Book a free consultation.',
  whatsIncluded: [],
  faqs: [],
  relatedArticleSlugs: null,
  ...overrides,
});

afterEach(() => vi.unstubAllGlobals());

describe('/services', () => {
  it('renders exactly one h1', async () => {
    stubApi([]);
    await renderServices();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders every published service, each linking to its own page', async () => {
    stubApi([
      apiService(),
      apiService({ id: 's2', slug: 'visa-support', title: 'Visa Application Support' }),
    ]);
    await renderServices();

    const main = screen.getByRole('main');
    expect(within(main).getByText('Free Educational Consultancy')).toBeInTheDocument();
    expect(
      within(main).getByRole('link', { name: /Free Educational Consultancy/ }),
    ).toHaveAttribute('href', '/services/free-consultancy');
    expect(within(main).getByRole('link', { name: /Visa Application Support/ })).toHaveAttribute(
      'href',
      '/services/visa-support',
    );
  });

  it('explains an empty list rather than showing a blank grid', async () => {
    stubApi([]);
    await renderServices();

    expect(screen.getByText(/being updated/)).toBeInTheDocument();
  });

  it('still renders a page when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    await renderServices();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/being updated/)).toBeInTheDocument();
  });
});
