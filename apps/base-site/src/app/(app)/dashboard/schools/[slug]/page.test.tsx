import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { InstitutionDetail } from '@/components/catalogue/InstitutionDetail';
import { renderPage } from '@/lib/page-harness';

/**
 * Only the dashboard-specific differences from the public page — the shared
 * rendering logic itself is already covered end to end by
 * `apps/base-site/src/app/universities/[slug]/page.test.tsx`.
 */
const detail = {
  id: 'i1',
  slug: 'cardiff-university',
  name: 'Cardiff University',
  aka: [],
  country: 'United Kingdom',
  countryCode: 'GB',
  city: 'Cardiff',
  fastTrackOffer: false,
  courseCount: 1,
  courseLevels: [{ value: 'postgraduate', count: 1 }],
  courseDisciplines: [],
};

const courseList = {
  items: [
    {
      id: 'c1',
      slug: 'msc-data-science-cardiff',
      title: 'MSc Data Science',
      level: 'postgraduate',
      studyMode: 'full_time',
      disciplines: [],
      fastTrackOffer: false,
      intakes: [],
      institutionId: 'i1',
      institutionName: 'Cardiff University',
      institutionSlug: 'cardiff-university',
      country: 'United Kingdom',
      countryCode: 'GB',
    },
  ],
  total: 1,
  page: 1,
  pageCount: 1,
};

const neighbours = {
  items: [
    {
      id: 'i2',
      slug: 'cardiff-metropolitan-university',
      name: 'Cardiff Metropolitan University',
      aka: [],
      country: 'United Kingdom',
      countryCode: 'GB',
      city: 'Cardiff',
      fastTrackOffer: false,
      courseCount: 0,
    },
  ],
  total: 1,
  page: 1,
  pageCount: 1,
};

const empty = { items: [], total: 0, page: 1, pageCount: 1 };

function stubApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const body = url.includes('/courses')
        ? courseList
        : url.includes('/articles')
          ? empty
          : url.includes('/institutions?')
            ? neighbours
            : detail;
      return { ok: true, status: 200, json: async () => body } as unknown as Response;
    }),
  );
}

const render = async () =>
  renderPage(
    await InstitutionDetail({
      slug: 'cardiff-university',
      query: {},
      applyMode: { kind: 'dashboard', basePath: '/dashboard/schools' },
    }),
  );

afterEach(() => vi.unstubAllGlobals());

describe('/dashboard/schools/[slug]', () => {
  it('sends the hero "Proceed to apply" to the courses on this same page, not to /register', async () => {
    stubApi();
    await render();

    const heroApply = screen.getAllByRole('link', { name: 'Proceed to apply' })[0];
    expect(heroApply).toHaveAttribute('href', '#courses');
  });

  it('links a neighbouring university back into the dashboard, not the public site', async () => {
    stubApi();
    await render();

    expect(screen.getByRole('link', { name: /Cardiff Metropolitan University/ })).toHaveAttribute(
      'href',
      '/dashboard/schools/cardiff-metropolitan-university',
    );
    expect(screen.getByRole('link', { name: 'Browse every university in United Kingdom' })).toHaveAttribute(
      'href',
      '/dashboard/schools?country=GB',
    );
  });

  it('drops the sign-up pitch — a dashboard visitor already has an account', async () => {
    stubApi();
    await render();

    expect(screen.queryByText(/Applying to Cardiff University\?/)).not.toBeInTheDocument();
  });
});
