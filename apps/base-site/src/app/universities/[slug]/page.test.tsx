import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import UniversityPage, { generateMetadata } from './page';

/**
 * Imported records carry a name, a location and whatever Wikidata could add.
 * These cover what the page does with what is missing, which for 6,400 rows is
 * most of it.
 */
const detail = {
  id: 'i1',
  slug: 'cardiff-university',
  name: 'Cardiff University',
  aka: [],
  country: 'United Kingdom',
  countryCode: 'GB',
  city: 'Cardiff',
  website: 'https://www.cardiff.ac.uk',
  fastTrackOffer: false,
  courseCount: 0,
  about: 'public research university in Cardiff, United Kingdom',
  foundedYear: 1883,
  studentCount: 30930,
  overview: 'Cardiff University is a public research university.\n\nIt was established in 1883.',
  overviewSourceUrl: 'https://en.wikipedia.org/wiki/Cardiff_University',
  heroImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cardiff.jpg?width=1200',
  highlights: ['Member of the Russell Group', 'Around 30,930 students enrolled'],
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
  total: 4,
  page: 1,
  pageCount: 1,
};

const articles = {
  items: [
    {
      id: 'a1',
      slug: 'uk-student-visa-order-of-events',
      title: 'The UK student route',
      excerpt: 'The steps have dependencies.',
      countryCode: 'GB',
      tags: ['visas'],
      readMinutes: 7,
    },
  ],
  total: 1,
  page: 1,
  pageCount: 1,
  tags: ['visas'],
};

const noCourses = { items: [], total: 0, page: 1, pageCount: 1 };

/** An imported course: a title, a level, a subject and an approximate fee. */
const courseList = {
  items: [
    {
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
    },
  ],
  total: 263,
  page: 1,
  pageCount: 22,
};

function stubApi(
  overrides: Partial<typeof detail> & {
    drop?: (keyof typeof detail)[];
    courses?: typeof courseList | typeof noCourses;
  } = {},
) {
  const record: Record<string, unknown> = { ...detail, ...overrides };
  for (const key of overrides.drop ?? []) delete record[key];
  delete record.drop;
  delete record.courses;

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const body = url.includes('/courses')
        ? (overrides.courses ?? noCourses)
        : url.includes('/articles')
        ? articles
        : url.includes('/institutions?')
          ? neighbours
          : record;
      return { ok: true, status: 200, json: async () => body } as unknown as Response;
    }),
  );
}

const render = async () =>
  renderPage(await UniversityPage({ params: Promise.resolve({ slug: 'cardiff-university' }) }));

afterEach(() => vi.unstubAllGlobals());

describe('/universities/[slug]', () => {
  it('shows the enriched facts', async () => {
    stubApi();
    await render();

    expect(screen.getByText('1883')).toBeInTheDocument();
    expect(screen.getByText('30,930')).toBeInTheDocument();
    expect(screen.getByText('cardiff.ac.uk')).toBeInTheDocument();
  });

  it('renders the overview as paragraphs, with its attribution', async () => {
    // Wikipedia text is CC BY-SA: the credit is a condition of use, not a
    // nicety, so it ships with the prose or the prose does not ship.
    stubApi();
    await render();

    expect(screen.getByText('It was established in 1883.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wikipedia' })).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/Cardiff_University',
    );
  });

  it('credits the campus photo back to its file page', async () => {
    stubApi();
    await render();

    expect(screen.getByRole('link', { name: /Photo: Wikimedia Commons/ })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Cardiff.jpg',
    );
  });

  it('shows highlights beside the overview', async () => {
    stubApi();
    await render();

    const highlights = within(screen.getByRole('complementary', { name: /highlights/i }));
    expect(highlights.getByText('Member of the Russell Group')).toBeInTheDocument();
  });

  it('falls back to the one-line description when there is no overview', async () => {
    stubApi({ drop: ['overview', 'overviewSourceUrl'] });
    await render();

    expect(
      screen.getByText('Cardiff University is a public research university in Cardiff, United Kingdom.'),
    ).toBeInTheDocument();
  });

  it('survives a website it cannot parse', async () => {
    // new URL throws on anything malformed, and these are imported for 6,400
    // institutions — one bad value must drop a card, not the page.
    stubApi({ website: 'not a url' });
    await render();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText('Official site')).toBeNull();
  });

  it('omits a fact it does not have rather than showing a placeholder', async () => {
    // Four cards all reading "Ask an advisor" say only that the page is empty.
    stubApi({ drop: ['foundedYear', 'studentCount'] });
    await render();

    // Scoped to the fact grid: the footer carries its own "Students" link.
    const facts = within(screen.getByRole('main'));
    expect(facts.queryByText('Founded')).toBeNull();
    expect(facts.queryByText('Students')).toBeNull();
  });

  it('never renders an empty "Required documents" heading', async () => {
    // An empty heading does not read as "unfilled", it reads as "none needed".
    stubApi();
    await render();

    expect(screen.queryByText('Required documents')).toBeNull();
  });

  it('offers other universities in the same city', async () => {
    stubApi();
    const { container } = await render();

    expect(
      within(container).getByRole('link', { name: /Cardiff Metropolitan University/ }),
    ).toHaveAttribute('href', '/universities/cardiff-metropolitan-university');
  });

  it('offers guidance for the destination', async () => {
    stubApi();
    await render();

    expect(screen.getByRole('link', { name: /The UK student route/ })).toHaveAttribute(
      'href',
      '/resources/uk-student-visa-order-of-events',
    );
  });

  it('lists its courses with the real count, and marks an approximate fee as one', async () => {
    stubApi({ courseCount: 263, courses: courseList });
    await render();

    const main = within(screen.getByRole('main'));
    expect(main.getByText('Courses listed')).toBeInTheDocument();
    expect(main.getByText('263')).toBeInTheDocument();
    expect(main.getByRole('link', { name: 'MSc Data Science' })).toHaveAttribute(
      'href',
      '/courses/msc-data-science-cardiff',
    );
    // The feed calls its figure approximate, so the card must too.
    expect(main.getByText('approx. £ 24,800')).toBeInTheDocument();
    expect(main.getByText('Data sciences and big data')).toBeInTheDocument();
  });

  it('pages through a long course list with shareable links', async () => {
    stubApi({ courseCount: 263, courses: courseList });
    await render();

    expect(screen.getByRole('link', { name: 'Next →' })).toHaveAttribute(
      'href',
      '/universities/cardiff-university?courses=2#courses',
    );
  });

  it('shows no course section for a university with none', async () => {
    stubApi();
    await render();

    expect(screen.queryByText('Courses at Cardiff University')).toBeNull();
    expect(within(screen.getByRole('main')).queryByText('Courses listed')).toBeNull();
  });

  describe('metadata', () => {
    const meta = () => generateMetadata({ params: Promise.resolve({ slug: 'cardiff-university' }) });

    it('describes the page from the overview, not the one-line fragment', async () => {
      stubApi();
      expect((await meta()).description).toBe(
        'Cardiff University is a public research university.\n\nIt was established in 1883.',
      );
    });

    it('cuts a long description on a word rather than mid-word', async () => {
      stubApi({ overview: `${'situated '.repeat(40)}end` });
      const description = (await meta()).description ?? '';

      expect(description.length).toBeLessThanOrEqual(156);
      expect(description).toMatch(/situated…$/);
    });

    it('falls back to the fragment when there is no overview', async () => {
      stubApi({ drop: ['overview'] });
      expect((await meta()).description).toBe(
        'public research university in Cardiff, United Kingdom',
      );
    });
  });
});
