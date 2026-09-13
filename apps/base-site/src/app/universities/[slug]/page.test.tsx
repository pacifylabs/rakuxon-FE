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
  /* The filters this university can offer, which the API derives from its own
     courses — not the 605 disciplines the whole catalogue holds. */
  courseLevels: [
    { value: 'undergraduate', count: 200 },
    { value: 'postgraduate', count: 63 },
  ],
  courseDisciplines: [
    { value: 'data-sciences-and-big-data', count: 12 },
    { value: 'business', count: 8 },
  ],
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

/** Courses at a different university, for the suggestion band. */
const elsewhereList = {
  ...courseList,
  items: [
    {
      ...courseList.items[0]!,
      id: 'c9',
      slug: 'msc-data-science-swansea',
      institutionName: 'Swansea University',
      institutionSlug: 'swansea-university',
    },
  ],
  total: 500,
};

function stubApi(
  overrides: Partial<typeof detail> & {
    drop?: (keyof typeof detail)[];
    courses?: typeof courseList | typeof noCourses;
    elsewhere?: typeof elsewhereList | typeof noCourses;
  } = {},
) {
  const record: Record<string, unknown> = { ...detail, ...overrides };
  for (const key of overrides.drop ?? []) delete record[key];
  delete record.drop;
  delete record.courses;
  delete record.elsewhere;

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      /* Two course calls reach this: the university's own list, and the
         country-wide one the page falls back to when it has none. */
      const body = url.includes('/courses')
        ? url.includes('institutionSlug')
          ? (overrides.courses ?? noCourses)
          : (overrides.elsewhere ?? noCourses)
        : url.includes('/articles')
          ? articles
          : url.includes('/institutions?')
            ? neighbours
            : record;
      return { ok: true, status: 200, json: async () => body } as unknown as Response;
    }),
  );
}

const render = async (query: Record<string, string> = {}) =>
  renderPage(
    await UniversityPage({
      params: Promise.resolve({ slug: 'cardiff-university' }),
      searchParams: Promise.resolve(query),
    }),
  );

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

  it('drops a hero that is the institution mark rather than cropping it', async () => {
    // Wikidata's only image for A.T. Still University is its wordmark, and the
    // banner cropped it into a wall of cut-off letterforms. It is also a
    // trademark, which the licence on the file does not cover.
    stubApi({
      heroImageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/ATSU%20logo.svg?width=1200',
    });
    await render();

    expect(screen.queryByRole('img', { name: /campus/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Photo: Wikimedia Commons/ })).toBeNull();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows highlights beside the overview', async () => {
    stubApi();
    await render();

    const highlights = within(screen.getByRole('complementary', { name: /highlights/i }));
    expect(highlights.getByText('Member of the Russell Group')).toBeInTheDocument();
  });

  it('lists each highlight once', async () => {
    // The band rendered the same list twice — once beside the overview and
    // again beneath it — so every university read as if it were stammering.
    stubApi();
    await render();

    expect(screen.getAllByText('Member of the Russell Group')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: /^highlights$/i })).toHaveLength(1);
  });

  it('falls back to the one-line description when there is no overview', async () => {
    stubApi({ drop: ['overview', 'overviewSourceUrl'] });
    await render();

    expect(
      screen.getByText(
        'Cardiff University is a public research university in Cardiff, United Kingdom.',
      ),
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
    // Scoped to the fact card: the level tabs carry the same number.
    expect(main.getByText('Courses listed').closest('div')).toHaveTextContent('263');
    expect(main.getByRole('link', { name: 'MSc Data Science' })).toHaveAttribute(
      'href',
      '/courses/msc-data-science-cardiff',
    );
    // The feed calls its figure approximate, so the card must too.
    expect(main.getByText('approx. £ 24,800')).toBeInTheDocument();
    expect(main.getByText('Data sciences and big data')).toBeInTheDocument();
  });

  it('offers a tab per level it teaches, carrying its count', async () => {
    stubApi({ courseCount: 263, courses: courseList });
    await render();

    const tabs = within(screen.getByRole('navigation', { name: 'Study level' }));
    expect(tabs.getByRole('link', { name: /Postgraduate/ })).toHaveAttribute(
      'href',
      '/universities/cardiff-university?level=postgraduate#courses',
    );
    expect(tabs.getByRole('link', { name: /Postgraduate/ })).toHaveTextContent('63');
    expect(tabs.getByRole('link', { name: /All levels/ })).toHaveAttribute('aria-current', 'page');
  });

  it('lists only the disciplines this university teaches', async () => {
    // The catalogue holds 605 of them; offering all would mostly lead nowhere.
    stubApi({ courseCount: 263, courses: courseList });
    await render();

    const select = screen.getByLabelText('Discipline');
    expect(
      within(select).getByRole('option', { name: 'Data sciences and big data (12)' }),
    ).toBeInTheDocument();
    expect(within(select).queryByRole('option', { name: /Archaeology/ })).toBeNull();
  });

  it('ignores a filter the university does not teach', async () => {
    // A stale or hand-edited link should show the whole list, not an empty one
    // filtered by something the page cannot even name.
    stubApi({ courseCount: 263, courses: courseList });
    await render({ level: 'doctorate' });

    const tabs = within(screen.getByRole('navigation', { name: 'Study level' }));
    expect(tabs.getByRole('link', { name: /All levels/ })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps a way back when a filter matches nothing', async () => {
    stubApi({ courseCount: 263, courses: noCourses });
    await render({ level: 'postgraduate' });

    expect(screen.getByText('No courses here match that filter.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Show all 263 courses/ })).toHaveAttribute(
      'href',
      '/universities/cardiff-university#courses',
    );
    // The controls stay: a filter that hides its own escape hatch is a trap.
    expect(screen.getByRole('navigation', { name: 'Study level' })).toBeInTheDocument();
  });

  it('pages through a long course list with shareable links', async () => {
    stubApi({ courseCount: 263, courses: courseList });
    await render();

    expect(screen.getByRole('link', { name: 'Next →' })).toHaveAttribute(
      'href',
      '/universities/cardiff-university?courses=2#courses',
    );
  });

  describe('a university whose courses we do not hold', () => {
    it('suggests courses elsewhere in the country, named as other universities', async () => {
      // The feed covers 367 of 6,665 institutions. The rest can still tell a
      // visitor what is studiable in the destination they just chose.
      stubApi({ courseCount: 0, elsewhere: elsewhereList });
      await render();

      expect(
        screen.getByRole('heading', { name: 'Courses at other universities in United Kingdom' }),
      ).toBeInTheDocument();
      // The card names the university that actually teaches it.
      expect(screen.getByText('Swansea University')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'MSc Data Science' })).toHaveAttribute(
        'href',
        '/courses/msc-data-science-swansea',
      );
    });

    it('offers the whole country and an advisor as the ways on', async () => {
      stubApi({ courseCount: 0, elsewhere: elsewhereList });
      await render();

      expect(
        screen.getByRole('link', { name: 'Browse every course in United Kingdom' }),
      ).toHaveAttribute('href', '/explore?tab=courses&country=GB');
      expect(
        screen.getByRole('link', { name: 'Ask an advisor about Cardiff University' }),
      ).toHaveAttribute('href', '/contact');
    });

    it('suggests nothing when the country has no courses either', async () => {
      stubApi({ courseCount: 0, elsewhere: noCourses });
      await render();

      expect(screen.queryByText(/Courses at other universities/)).toBeNull();
    });

    it('never suggests other universities to one that has its own courses', async () => {
      stubApi({ courseCount: 263, courses: courseList, elsewhere: elsewhereList });
      await render();

      expect(screen.queryByText(/Courses at other universities/)).toBeNull();
    });
  });

  describe('a record with nothing written about it', () => {
    /* The two bands whose order is in question. The sign-up prompt at the foot
       is also headed "Applying to …", so these are matched exactly. */
    const bands = ['About Cardiff University', 'Applying to United Kingdom'];
    const headingOrder = () =>
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent ?? '')
        .filter((text) => bands.includes(text));

    it('leads with the guidance rather than with "we have not written this up"', async () => {
      stubApi({ drop: ['overview', 'overviewSourceUrl', 'about'] });
      await render();

      expect(headingOrder()).toEqual(['Applying to United Kingdom', 'About Cardiff University']);
    });

    it('leads with the overview where there is one', async () => {
      stubApi();
      await render();

      expect(headingOrder()).toEqual(['About Cardiff University', 'Applying to United Kingdom']);
    });
  });

  it('shows no course section for a university with none', async () => {
    stubApi();
    await render();

    expect(screen.queryByText('Courses at Cardiff University')).toBeNull();
    expect(within(screen.getByRole('main')).queryByText('Courses listed')).toBeNull();
  });

  describe('metadata', () => {
    const meta = () =>
      generateMetadata({ params: Promise.resolve({ slug: 'cardiff-university' }) });

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
