import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { COURSES } from '@/lib/catalogue/bank';
import { renderPage } from '@/lib/page-harness';

import CoursePage, { generateMetadata } from './page';

/**
 * An imported course as the catalogue sends it: a title, a level, a subject and
 * an approximate fee — and nothing else. These tests are about what the page
 * does with everything that is missing.
 */
const imported = {
  id: 'c1',
  slug: 'msc-data-science-cardiff',
  title: 'MSc Data Science',
  level: 'postgraduate',
  studyMode: 'full_time',
  disciplines: ['data-sciences-and-big-data'],
  tuitionAmount: '24800.00',
  tuitionCurrency: 'GBP',
  tuitionIsEstimate: true,
  fastTrackOffer: false,
  intakes: [],
  institutionId: 'i1',
  institutionName: 'Cardiff University',
  institutionSlug: 'cardiff-university',
  country: 'United Kingdom',
  countryCode: 'GB',
  highlights: [],
  tuitionPeriod: 'year',
  entryRequirements: [],
  englishTests: [],
  scholarships: [],
};

const sibling = {
  ...imported,
  id: 'c2',
  slug: 'ma-journalism-cardiff',
  title: 'MA Journalism',
  tuitionAmount: undefined,
  tuitionIsEstimate: false,
  disciplines: ['journalism'],
};

/** The catalogue as a stub: courses by slug, the university's list, and 404 for anything else. */
function stubCatalogue(known: Record<string, unknown> = { [imported.slug]: imported }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/courses?')) {
        const list = { items: [imported, sibling], total: 2, page: 1, pageCount: 1 };
        return { ok: true, status: 200, json: async () => list } as unknown as Response;
      }

      const slug = decodeURIComponent(url.split('/courses/')[1] ?? '');
      const body = known[slug];
      return (
        body
          ? { ok: true, status: 200, json: async () => body }
          : { ok: false, status: 404, json: async () => ({}) }
      ) as unknown as Response;
    }),
  );
}

const render = async (slug: string) =>
  renderPage(await CoursePage({ params: Promise.resolve({ slug }) }));

afterEach(() => vi.unstubAllGlobals());

describe('/courses/[slug]', () => {
  it('renders an imported course from the catalogue', async () => {
    stubCatalogue();
    await render(imported.slug);

    expect(screen.getByRole('heading', { level: 1, name: 'MSc Data Science' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Cardiff University' })[0]).toHaveAttribute(
      'href',
      '/universities/cardiff-university',
    );
  });

  it('marks an approximate fee as one', async () => {
    // The feed calls its figure an approximate annual fee; showing it as a
    // fee would be a promise the data does not make.
    stubCatalogue();
    await render(imported.slug);

    expect(screen.getByText('approx. £ 24,800')).toBeInTheDocument();
    expect(screen.getByText('Tuition fee, per year')).toBeInTheDocument();
  });

  it('hides the sections an imported course has nothing for', async () => {
    // An empty "Requirements" heading reads as "none needed", which is not what we know.
    stubCatalogue();
    await render(imported.slug);

    expect(screen.queryByRole('heading', { name: 'Requirements' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Intakes' })).toBeNull();
    // A database default is not a stated study mode.
    expect(screen.queryByText('Mode of study')).toBeNull();
  });

  it('lists other courses at the same university from the catalogue', async () => {
    stubCatalogue();
    await render(imported.slug);

    expect(screen.getByRole('link', { name: /MA Journalism/ })).toHaveAttribute(
      'href',
      '/courses/ma-journalism-cardiff',
    );
  });

  it('falls back to a hand-written sample when the catalogue does not have it', async () => {
    stubCatalogue({});
    const sample = COURSES[0]!;
    await render(sample.slug);

    expect(screen.getByRole('heading', { level: 1, name: sample.title })).toBeInTheDocument();
  });

  it('is not found when neither source has it', async () => {
    stubCatalogue({});
    await expect(CoursePage({ params: Promise.resolve({ slug: 'no-such-course' }) })).rejects.toThrow();
  });

  it('describes a course with no overview from what it does hold', async () => {
    stubCatalogue();
    const meta = await generateMetadata({ params: Promise.resolve({ slug: imported.slug }) });

    expect(meta.description).toBe(
      "MSc Data Science at Cardiff University, United Kingdom. Fees, entry requirements and how to apply, with Rakuxon's support.",
    );
  });
});
