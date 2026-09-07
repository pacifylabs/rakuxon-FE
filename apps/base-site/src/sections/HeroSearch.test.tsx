import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroSearch } from './HeroSearch';

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

describe('HeroSearch typeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ items: [] })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps the GET explore contract', () => {
    render(<HeroSearch />);
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('action', '/explore');
    expect(form).toHaveAttribute('method', 'get');
  });

  it('does not fetch until two characters are typed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'c');
    await vi.advanceTimersByTimeAsync(400);

    expect(fetch).not.toHaveBeenCalled();
  });

  const SUGGESTIONS = {
    items: [
      {
        type: 'institution',
        id: 'inst-1',
        slug: 'northfield-university',
        title: 'Northfield University',
        subtitle: 'Manchester, United Kingdom',
        badges: ['Fast-track offer'],
      },
      {
        type: 'course',
        id: 'course-1',
        slug: 'mba-business-administration-northfield',
        title: 'MBA Business Administration',
        subtitle: 'Northfield University, United Kingdom',
      },
    ],
  };

  it('asks the catalogue to rank, instead of filtering in the browser', async () => {
    // The previous version pulled a whole resource list and filtered it here,
    // which works for a few dozen rows and fails once the bank holds thousands.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/api/catalogue/suggest?q=nor');
  });

  it('sends each result to its own page, not back to a search', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');
    await vi.advanceTimersByTimeAsync(300);

    expect(await screen.findByRole('option', { name: /^Northfield University/ })).toHaveAttribute(
      'href',
      '/universities/northfield-university',
    );
    expect(screen.getByRole('option', { name: /^MBA Business Administration/ })).toHaveAttribute(
      'href',
      '/courses/mba-business-administration-northfield',
    );
  });

  it('puts universities above courses', async () => {
    // Someone typing a university name wants the university, not four of its
    // own courses stacked on top of it.
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');
    await vi.advanceTimersByTimeAsync(300);

    await screen.findByRole('option', { name: /^Northfield University/ });
    const groups = screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));
    expect(groups).toEqual(['Universities', 'Courses']);
  });

  it('numbers options across groups, so the arrow keys track what is on screen', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    const field = screen.getByLabelText('Search courses, universities and guidance');
    await user.type(field, 'nor');
    await vi.advanceTimersByTimeAsync(300);
    await screen.findByRole('option', { name: /^Northfield University/ });

    // Restarting the index per group would leave aria-activedescendant pointing
    // at the wrong row the moment the second group is reached.
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const active = field.getAttribute('aria-activedescendant');
    expect(document.getElementById(active ?? '')).toHaveTextContent('MBA Business Administration');
  });

  it('shows the incentive badges the catalogue returns', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(SUGGESTIONS));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'nor');
    await vi.advanceTimersByTimeAsync(300);

    expect(await screen.findByText('Fast-track offer')).toBeInTheDocument();
  });
});
