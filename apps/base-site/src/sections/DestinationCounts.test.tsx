import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

import { DestinationCounts } from './DestinationCounts';

afterEach(() => vi.unstubAllGlobals());

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

async function renderCounts() {
  const element = await DestinationCounts();
  return render(<ThemeProvider>{element}</ThemeProvider>);
}

describe('<DestinationCounts/>', () => {
  it('renders an institution count per country from the catalogue', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        ok([
          { countryCode: 'GB', country: 'United Kingdom', institutions: 42 },
          { countryCode: 'CA', country: 'Canada', institutions: 7 },
        ]),
      ),
    );

    await renderCounts();

    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('renders nothing when the catalogue has no enabled countries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ok([])),
    );

    await renderCounts();

    expect(
      screen.queryByRole('heading', { name: /how many institutions/i }),
    ).not.toBeInTheDocument();
  });

  it('fails soft when the catalogue is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );

    await renderCounts();

    expect(
      screen.queryByRole('heading', { name: /how many institutions/i }),
    ).not.toBeInTheDocument();
  });
});
