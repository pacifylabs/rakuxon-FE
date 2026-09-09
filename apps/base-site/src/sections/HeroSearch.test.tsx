import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroSearch } from './HeroSearch';

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

/*
 * Real timers, deliberately.
 *
 * These used fake timers to skip the 280ms debounce, which meant every test
 * had to advance the clock by an amount that also happened to cover the fetch
 * settling. That coupling is invisible and breaks for unrelated reasons — a
 * new import in the component was enough to make five of them hang on
 * "Searching…". Waiting 280ms of real time costs nothing and cannot drift.
 */
describe('HeroSearch typeahead', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ total: 0, items: [] })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the GET explore contract', () => {
    render(<HeroSearch />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('action', '/explore');
    expect(form).toHaveAttribute('method', 'get');
  });

  it('does not fetch until two characters are typed', async () => {
    const user = userEvent.setup();
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'c');
    /* Past the debounce, so this proves nothing was sent rather than that
       nothing had been sent yet. */
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(fetch).not.toHaveBeenCalled();
  });

  /*
   * The exact shape /v1/catalogue/search returns.
   *
   * These previously used `title` and `badges`, which the API does not send —
   * so the suite passed while every dropdown row rendered a blank name. A
   * fixture that encodes an invented contract tests the invention, not the
   * integration.
   */
  const SUGGESTIONS = {
    total: 2,
    items: [
      {
        type: 'institution',
        id: 'inst-1',
        slug: 'northfield-university',
        name: 'Northfield University',
        subtitle: 'Manchester, United Kingdom',
        countryCode: 'GB',
        highlight: [
          { text: 'Nor', match: true },
          { text: 'thfield University', match: false },
        ],
      },
      {
        type: 'course',
        id: 'course-1',
        slug: 'mba-business-administration-northfield',
        name: 'MBA Business Administration',
        subtitle: 'Northfield University, United Kingdom',
        countryCode: 'GB',
        highlight: [{ text: 'MBA Business Administration', match: false }],
      },
    ],
  };

  it('asks the catalogue to rank, instead of filtering in the browser', async () => {
    // The previous version pulled a whole resource list and filtered it here,
    // which works for a few dozen rows and fails once the bank holds thousands.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/api/catalogue/suggest?q=nor');
  });

  it('sends each result to its own page, not back to a search', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');

    /*
     * Scoped to the group rather than matched on the option's accessible name.
     * The name now begins with the country flag, so anchoring on the
     * university's name broke — and a course whose subtitle names the same
     * university matches an unanchored one.
     */
    const universities = await screen.findByRole('group', { name: 'Universities' });
    expect(within(universities).getByRole('option')).toHaveAttribute(
      'href',
      '/universities/northfield-university',
    );

    const courses = screen.getByRole('group', { name: 'Courses' });
    expect(within(courses).getByRole('option')).toHaveAttribute(
      'href',
      '/courses/mba-business-administration-northfield',
    );
  });

  it('puts universities above courses', async () => {
    // Someone typing a university name wants the university, not four of its
    // own courses stacked on top of it.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');

    await screen.findByRole('group', { name: 'Universities' });
    const groups = screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));
    expect(groups).toEqual(['Universities', 'Courses']);
  });

  it('numbers options across groups, so the arrow keys track what is on screen', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    render(<HeroSearch />);

    const field = screen.getByLabelText('Search courses, universities and guidance');
    await user.type(field, 'nor');
    await screen.findByRole('group', { name: 'Universities' });

    // Restarting the index per group would leave aria-activedescendant pointing
    // at the wrong row the moment the second group is reached.
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const active = field.getAttribute('aria-activedescendant');
    expect(document.getElementById(active ?? '')).toHaveTextContent('MBA Business Administration');
  });

  it('renders the name, which is the field the API actually sends', async () => {
    // The regression this suite missed: the component read `title`, the API
    // sends `name`, and every row rendered blank.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');

    const universities = await screen.findByRole('group', { name: 'Universities' });
    expect(within(universities).getByRole('option')).toHaveTextContent('Northfield University');
  });

  it('emphasises the matched run rather than injecting markup', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup();
    const { container } = render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');
    await screen.findByRole('group', { name: 'Universities' });

    expect(container.querySelector('mark')).toHaveTextContent('Nor');
  });
});
