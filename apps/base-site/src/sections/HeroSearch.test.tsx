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

  it('fetches universities with q and lists matches', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 'ror:oxford',
            name: 'University of Oxford',
            city: 'Oxford',
            country: 'United Kingdom',
          },
        ],
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.selectOptions(screen.getByLabelText('Type'), 'universities');
    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'ox');
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/api/catalogue/universities?q=ox');

    const option = await screen.findByRole('option', { name: /University of Oxford/ });
    expect(option).toHaveAttribute(
      'href',
      '/explore?tab=universities&q=University+of+Oxford',
    );
  });

  it('filters courses locally because upstream ignores q', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        items: [
          { id: '1', title: 'Computer Science MSc', institution: 'UCL', country: 'United Kingdom' },
          { id: '2', title: 'History BA', institution: 'Oxford', country: 'United Kingdom' },
        ],
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<HeroSearch />);

    await user.type(screen.getByLabelText('Search courses, universities and guidance'), 'comp');
    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toBe('/api/catalogue/courses');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).not.toContain('q=');

    expect(await screen.findByRole('option', { name: /Computer Science MSc/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /History BA/ })).not.toBeInTheDocument();
  });
});
