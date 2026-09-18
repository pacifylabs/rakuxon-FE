import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ABOUT_STATS, ABOUT_VISION_MISSION } from './about';
import { STATS } from './home';
import { buildDestinationLinks, buildFooterColumns } from './site';
import { ALL_ROUTES, ROUTES } from './routes';
import { renderPage } from '../lib/page-harness';
import { DEFAULT_SITE_SETTINGS } from '../lib/site-settings/api';

/**
 * Rakuxon Ltd is a real company. These pin the details transcribed from
 * rakuxon.com so a refactor cannot quietly reinstate the invented placeholders
 * they replaced — a wrong phone number or a fictional success rate on a real
 * business is a different class of bug from a layout regression. The
 * contact/social/footer facts themselves are admin-authored now (see
 * `lib/site-settings/api.ts`); what's pinned here is `DEFAULT_SITE_SETTINGS`,
 * the fallback the site renders if that API is ever unreachable — it must
 * never regress to a fabricated placeholder either.
 */

describe('contact details', () => {
  it('uses the real enquiry address, not the invented one', () => {
    expect(DEFAULT_SITE_SETTINGS.contactEmail).toBe('enquiries@rakuxon.com');
    expect(DEFAULT_SITE_SETTINGS.contactEmail).not.toContain('hello@');
  });

  it('lists both published phone numbers', () => {
    expect(DEFAULT_SITE_SETTINGS.contactPhones).toEqual(['+234 816 717 8847', '+44 776 094 4935']);
  });

  it('names both real offices rather than claiming remote-first', () => {
    const flat = DEFAULT_SITE_SETTINGS.contactAddresses
      .map((office) => `${office.label} ${office.lines.join(' ')}`)
      .join(' ');

    expect(DEFAULT_SITE_SETTINGS.contactAddresses).toHaveLength(2);
    expect(flat).toContain('London SE17 2PJ');
    expect(flat).toContain('Surulere, Lagos');
    expect(flat).not.toMatch(/remote-first/i);
  });

  it('points every social at a real Rakuxon profile', () => {
    expect(DEFAULT_SITE_SETTINGS.socials.map((social) => social.label)).toEqual([
      'WhatsApp',
      'Instagram',
      'TikTok',
      'X',
      'Facebook',
      'YouTube',
    ]);

    // A bare platform homepage is what the placeholders were; each of these
    // has to reach the company's own account. WhatsApp is the exception by
    // nature — wa.me addresses a phone number, not a handle, so it carries the
    // real Nigerian line instead.
    for (const social of DEFAULT_SITE_SETTINGS.socials) {
      const expected = social.label === 'WhatsApp' ? /wa\.me\/2348167178847/ : /rakuxon/i;
      expect(social.href).toMatch(expected);
    }
  });
});

describe('statistics', () => {
  it('uses the figures Rakuxon Ltd publishes', () => {
    expect(STATS.map((stat) => stat.value)).toEqual(['2,500+', '200+', '11+', '95%']);
  });

  it('keeps the about page in step with the home page', () => {
    // Two places showing different numbers for the same company is worse than
    // showing them in one.
    expect(ABOUT_STATS.map((stat) => stat.value)).toEqual(STATS.map((stat) => stat.value));
  });

  it('carries none of the invented figures it replaced', () => {
    const values = STATS.map((stat) => stat.value).join(' ');
    for (const invented of ['100,000+', '1,500+', '1,200+', '150+']) {
      expect(values).not.toContain(invented);
    }
  });
});

describe('vision and mission', () => {
  it('quotes both statements verbatim', () => {
    const [vision, mission] = ABOUT_VISION_MISSION.items;

    expect(vision?.body).toBe(
      'To become the premier global bridge connecting dreams with destinations, empowering individuals to explore, learn, and achieve without limits.',
    );
    expect(mission?.body).toBe(
      'To deliver trusted, personalized, and innovative educational consultancy and travel services, transforming aspirations into achievements through expert guidance, exceptional service, and unwavering commitment to client success.',
    );
  });
});

describe('footer links', () => {
  it('resolves every service link to its own page', () => {
    const columns = buildFooterColumns(buildDestinationLinks([]));
    const services = columns.find((column) => column.heading === 'Our services');
    expect(services?.links).toHaveLength(6);

    for (const link of services?.links ?? []) {
      expect(ALL_ROUTES).toContain(link.href);
    }
  });

  it('points a destination with a written guide at that guide, and any other enabled country at the filtered catalogue', () => {
    const links = buildDestinationLinks([
      { countryCode: 'GB', country: 'United Kingdom' },
      { countryCode: 'KE', country: 'Kenya' },
    ]);

    expect(links).toEqual([
      { label: 'United Kingdom', href: '/destinations/uk', countryCode: 'GB' },
      { label: 'Kenya', href: '/universities?country=KE', countryCode: 'KE' },
      { label: 'All destinations', href: ROUTES.destinations },
    ]);
  });

  it('resolves every destination link to a real route, whatever the catalogue currently holds', () => {
    const links = buildDestinationLinks([
      { countryCode: 'GB', country: 'United Kingdom' },
      { countryCode: 'KE', country: 'Kenya' },
    ]);
    const columns = buildFooterColumns(links);
    const destinations = columns.find((column) => column.heading === 'Destinations');

    for (const link of destinations?.links ?? []) {
      // Filtered catalogue links carry a query string; ALL_ROUTES holds bare paths.
      expect(ALL_ROUTES).toContain(link.href.split('?')[0]);
    }
  });

  it('falls back to just "All destinations" when the catalogue is unreachable', () => {
    expect(buildDestinationLinks([])).toEqual([
      { label: 'All destinations', href: ROUTES.destinations },
    ]);
  });

  it('renders the real details in the rendered footer, not just the module', () => {
    renderPage(<div />);

    expect(screen.getByRole('link', { name: /enquiries@rakuxon\.com/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+234 816 717 8847' })).toHaveAttribute(
      'href',
      'tel:+2348167178847',
    );
    expect(screen.getByText(/London SE17 2PJ/)).toBeInTheDocument();
    expect(screen.getByText(/Surulere, Lagos/)).toBeInTheDocument();
  });
});
