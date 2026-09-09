import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderPage } from '@/lib/page-harness';

import DestinationsPage from './page';

/**
 * Async now that the destination list comes from the catalogue, so it needs
 * its own harness rather than the synchronous page sweep.
 */
const COUNTRIES = [
  { countryCode: 'GB', country: 'United Kingdom', institutions: 500 },
  { countryCode: 'HU', country: 'Hungary', institutions: 39 },
];

function stubCountries(rows: unknown = COUNTRIES) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => rows }) as unknown as Response),
  );
}

const render = async () => renderPage(await DestinationsPage());

/* Scoped to main: the footer carries its own destination links, so an
   unscoped query matches twice and throws. */
const grid = () => within(screen.getByRole('main'));

afterEach(() => vi.unstubAllGlobals());

describe('/destinations', () => {
  it('renders exactly one h1', async () => {
    stubCountries();
    await render();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('lists every country the catalogue holds, not a hand-written six', async () => {
    stubCountries();
    await render();
    expect(grid().getByRole('link', { name: /United Kingdom/ })).toBeInTheDocument();
    expect(grid().getByRole('link', { name: /Hungary/ })).toBeInTheDocument();
  });

  it('sends a country with a written guide to that guide', async () => {
    stubCountries();
    await render();
    expect(grid().getByRole('link', { name: /United Kingdom/ })).toHaveAttribute(
      'href',
      '/destinations/uk',
    );
  });

  it('sends a country without one to the filtered listing, not a stub page', async () => {
    // Fourteen of the twenty have no written guide. A card that opens an empty
    // template is worse than one that opens the universities actually there.
    stubCountries();
    await render();
    expect(grid().getByRole('link', { name: /Hungary/ })).toHaveAttribute(
      'href',
      '/universities?country=HU',
    );
  });

  it('shows the catalogue count where there is no tagline to show', async () => {
    stubCountries();
    await render();
    expect(screen.getByText('39 universities in the catalogue.')).toBeInTheDocument();
  });

  it('still renders if the catalogue is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    await render();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
