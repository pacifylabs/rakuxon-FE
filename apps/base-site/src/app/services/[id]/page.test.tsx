import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import ServicePage from './page';

interface FixtureService {
  id: string;
  slug: string;
  iconName: string;
  title: string;
  summary: string;
  description: string;
  strand: string;
  metaTitle: string;
  metaDescription: string;
  whatsIncluded: string[];
  faqs: { question: string; answer: string }[];
  relatedArticleSlugs: string[] | null;
}

const freeConsultancy: FixtureService = {
  id: 's1',
  slug: 'free-consultancy',
  iconName: 'Compass',
  title: 'Free Educational Consultancy',
  summary: 'Where every journey starts, at no cost.',
  description: 'Complimentary expert guidance.',
  strand: 'education',
  metaTitle: 'Free Study Abroad Consultation',
  metaDescription: 'Book a free consultation.',
  whatsIncluded: ['A one-to-one conversation'],
  faqs: [{ question: 'Is it free?', answer: 'Yes.' }],
  relatedArticleSlugs: ['how-to-choose-a-university-abroad'],
};

const visaSupport = {
  ...freeConsultancy,
  id: 's2',
  slug: 'visa-support',
  title: 'Visa Application Support',
  relatedArticleSlugs: null,
};

const article = {
  slug: 'how-to-choose-a-university-abroad',
  title: 'How to choose a university abroad',
  excerpt: 'A short guide.',
  readMinutes: 5,
};

function ok(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function notFoundResponse() {
  return { ok: false, status: 404, json: async () => ({}) } as Response;
}

function stubApi({
  services = [freeConsultancy, visaSupport],
  articleFound = true,
}: { services?: FixtureService[]; articleFound?: boolean } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/v1/catalogue/articles/')) {
        return articleFound ? ok(article) : notFoundResponse();
      }
      if (/\/v1\/services\/[^/]+$/.test(url)) {
        const slug = decodeURIComponent(url.split('/').pop() ?? '');
        const match = services.find((service) => service.slug === slug);
        return match ? ok(match) : notFoundResponse();
      }
      if (url.includes('/v1/services')) {
        return ok(services);
      }
      return notFoundResponse();
    }),
  );
}

const renderService = async (id: string) =>
  renderPage(await ServicePage({ params: Promise.resolve({ id }) }));

afterEach(() => vi.unstubAllGlobals());

describe('/services/[id]', () => {
  it("renders the service heading, description and what's included", async () => {
    stubApi();
    await renderService('free-consultancy');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Free Educational Consultancy' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Complimentary expert guidance.')).toBeInTheDocument();
    expect(screen.getByText('A one-to-one conversation')).toBeInTheDocument();
  });

  it('renders related services in the same strand, excluding itself', async () => {
    stubApi();
    await renderService('free-consultancy');

    expect(screen.getByRole('link', { name: /Visa Application Support/ })).toHaveAttribute(
      'href',
      '/services/visa-support',
    );
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Free Educational Consultancy' }),
    ).not.toBeInTheDocument();
  });

  it('renders a related article by slug', async () => {
    stubApi();
    await renderService('free-consultancy');

    expect(screen.getByText('How to choose a university abroad')).toBeInTheDocument();
  });

  it('drops a related article slug that no longer resolves, rather than showing broken', async () => {
    stubApi({ articleFound: false });
    await renderService('free-consultancy');

    expect(screen.queryByText('Guidance worth reading first')).not.toBeInTheDocument();
  });

  it('renders its FAQs', async () => {
    stubApi();
    await renderService('free-consultancy');

    expect(screen.getByText('Is it free?')).toBeInTheDocument();
    expect(screen.getByText('Yes.')).toBeInTheDocument();
  });

  it('404s for an unknown slug', async () => {
    stubApi();
    await expect(renderService('not-a-real-service')).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404',
    );
  });
});
