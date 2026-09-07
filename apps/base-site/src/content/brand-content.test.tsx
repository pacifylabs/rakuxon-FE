import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { initialsOf } from '@rakuxon/ui';

import { ABOUT_STATS, ABOUT_VISION_MISSION } from './about';
import { STATS, TESTIMONIALS } from './home';
import { SERVICES } from './services';
import {
  CONTACT_ADDRESSES,
  CONTACT_EMAIL,
  CONTACT_PHONES,
  FOOTER_COLUMNS,
  SOCIALS,
} from './site';
import { ALL_ROUTES } from './routes';
import ServicesPage from '../app/services/page';
import { renderPage } from '../lib/page-harness';

/**
 * Rakuxon Ltd is a real company. These pin the details transcribed from
 * rakuxon.com so a refactor cannot quietly reinstate the invented placeholders
 * they replaced — a wrong phone number or a fictional success rate on a real
 * business is a different class of bug from a layout regression.
 */

describe('contact details', () => {
  it('uses the real enquiry address, not the invented one', () => {
    expect(CONTACT_EMAIL).toBe('enquiries@rakuxon.com');
    expect(CONTACT_EMAIL).not.toContain('hello@');
  });

  it('lists both published phone numbers', () => {
    expect(CONTACT_PHONES).toEqual(['+234 816 717 8847', '+44 776 094 4935']);
  });

  it('names both real offices rather than claiming remote-first', () => {
    const flat = CONTACT_ADDRESSES.map(
      (office) => `${office.label} ${office.lines.join(' ')}`,
    ).join(' ');

    expect(CONTACT_ADDRESSES).toHaveLength(2);
    expect(flat).toContain('London SE17 2PJ');
    expect(flat).toContain('Surulere, Lagos');
    expect(flat).not.toMatch(/remote-first/i);
  });

  it('points every social at a real Rakuxon profile', () => {
    expect(SOCIALS.map((social) => social.label)).toEqual([
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
    for (const social of SOCIALS) {
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

describe('testimonials', () => {
  it('is the six real clients', () => {
    expect(TESTIMONIALS.map((entry) => entry.name)).toEqual([
      'Sarah Adebayo',
      'Michael Okafor',
      'Fatima Kone',
      'David Adamu',
      'Amaka & Chinedu Eze',
      'Tomiwa Adedeji',
    ]);
  });

  it('gives no real person a stock face', () => {
    // The quotes are attributed to named people at named universities. A
    // stranger's portrait beside that name misrepresents them, and it stops
    // being arguable the moment somebody recognises the photo.
    for (const entry of TESTIMONIALS) {
      expect(entry).not.toHaveProperty('src');
    }
  });

  it('derives the initials rakuxon.com shows', () => {
    expect(initialsOf('Sarah Adebayo')).toBe('SA');
    expect(initialsOf('Amaka & Chinedu Eze')).toBe('AE');
    expect(initialsOf('Tomiwa Adedeji')).toBe('TA');
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

describe('services', () => {
  it('carries all six, with travel marked as its own strand', () => {
    expect(SERVICES).toHaveLength(6);
    expect(SERVICES.filter((service) => service.strand === 'travel')).toHaveLength(1);
  });

  it('renders every service with its own heading', () => {
    render(<ServicesPage />);

    for (const service of SERVICES) {
      expect(screen.getAllByText(service.title).length).toBeGreaterThan(0);
    }
  });

  it('separates travel from the study-abroad services', () => {
    render(<ServicesPage />);

    // A student comparing courses should not have to read past honeymoon
    // packages to reach visa support.
    expect(screen.getByRole('heading', { name: 'Studying abroad' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Travel and tourism' })).toBeInTheDocument();
  });

  it('leads with the free consultancy, which is the way in', () => {
    expect(SERVICES[0]?.id).toBe('free-consultancy');
  });
});

describe('footer links', () => {
  it('resolves every service link to an anchor on a page that exists', () => {
    const services = FOOTER_COLUMNS.find((column) => column.heading === 'Our services');
    expect(services?.links).toHaveLength(6);

    for (const link of services?.links ?? []) {
      const [path, hash] = link.href.split('#');
      expect(ALL_ROUTES).toContain(path);
      expect(SERVICES.map((service) => service.id)).toContain(hash);
    }
  });

  it('lists only destinations that have a page', () => {
    // rakuxon.com's footer offers "Europe" and "Travel Packages"; neither is a
    // page here, and shipping them would be two dead links.
    const destinations = FOOTER_COLUMNS.find((column) => column.heading === 'Destinations');

    for (const link of destinations?.links ?? []) {
      expect(ALL_ROUTES).toContain(link.href);
    }
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
