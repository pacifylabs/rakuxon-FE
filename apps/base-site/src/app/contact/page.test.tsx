import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ALL_ROUTES } from '@/content/routes';
import { buildNavLinks } from '@/content/site';
import { internalPaths, renderPage } from '@/lib/page-harness';
import { DEFAULT_SITE_SETTINGS } from '@/lib/site-settings/api';

import ContactPage from './page';

function stubApi(body: unknown = DEFAULT_SITE_SETTINGS) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => body }) as unknown as Response),
  );
}

const renderContact = async () => renderPage(await ContactPage());

afterEach(() => vi.unstubAllGlobals());

describe('/contact', () => {
  it('renders exactly one h1, carrying the page title', async () => {
    stubApi();
    await renderContact();

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Tell us which side you are on/i);
  });

  it('exposes banner, main and contentinfo landmarks', async () => {
    stubApi();
    await renderContact();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('reaches every nav destination from the shared header', async () => {
    stubApi();
    await renderContact();

    const banner = screen.getByRole('banner');
    for (const link of buildNavLinks([])) {
      expect(within(banner).getAllByRole('link', { name: link.label }).length).toBeGreaterThan(0);
    }
  });

  it('carries the legal links in the shared footer', async () => {
    stubApi();
    await renderContact();

    const contentinfo = screen.getByRole('contentinfo');
    expect(within(contentinfo).getByRole('link', { name: 'Privacy policy' })).toBeInTheDocument();
    expect(within(contentinfo).getByRole('link', { name: 'Terms of service' })).toBeInTheDocument();
  });

  it('links only to routes that exist', async () => {
    stubApi();
    const { container } = await renderContact();

    const unknown = internalPaths(container).filter((path) => !ALL_ROUTES.includes(path));
    expect(unknown).toEqual([]);
  });

  it('mails to the fetched contact email, not a hardcoded one', async () => {
    stubApi({ ...DEFAULT_SITE_SETTINGS, contactEmail: 'help@rakuxon.com' });
    await renderContact();

    expect(screen.getByRole('link', { name: 'help@rakuxon.com' })).toHaveAttribute(
      'href',
      'mailto:help@rakuxon.com',
    );
  });

  it('still renders a page when the site-settings API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('down');
      }),
    );
    await renderContact();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getAllByRole('link', { name: DEFAULT_SITE_SETTINGS.contactEmail }).length,
    ).toBeGreaterThan(0);
  });
});
