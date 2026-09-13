import { describe, expect, it } from 'vitest';

import { ROUTES } from './routes';
import { FOOTER_COLUMNS, NAV_LINKS } from './site';

const labels = NAV_LINKS.map((link) => link.label);
const destinations = NAV_LINKS.find((link) => link.label === 'Destinations');
const footerLinks = FOOTER_COLUMNS.flatMap((column) => column.links);

describe('primary navigation', () => {
  it('leads with the catalogue and names the two audiences that arrive cold', () => {
    expect(labels).toEqual([
      'Universities',
      'Destinations',
      'Students',
      'Agents',
      'Services',
      'Study guides',
      'About',
    ]);
  });

  it('opens destinations as a country menu, each with its flag', () => {
    const countries = destinations?.children?.filter((child) => child.label !== 'All destinations');

    expect(countries?.length).toBe(6);
    for (const country of countries ?? []) {
      expect(country.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(country.href).toMatch(/^\/destinations\/[a-z-]+$/);
    }
  });

  it('ends the country menu with the whole list', () => {
    // A menu of six must not imply we cover only six.
    expect(destinations?.children?.at(-1)).toEqual({
      label: 'All destinations',
      href: ROUTES.destinations,
    });
  });

  it('carries no course entry, because a course belongs to a university', () => {
    // Courses are reached through the university page and the search bar; a
    // third door into the same rows is what made the bar crowded.
    expect(labels).not.toContain('Courses');
    expect(NAV_LINKS.some((link) => link.href === ROUTES.explore)).toBe(false);
  });

  it('keeps the institutions page reachable from the footer it left the bar for', () => {
    expect(NAV_LINKS.some((link) => link.href === ROUTES.institutions)).toBe(false);
    expect(footerLinks.some((link) => link.href === ROUTES.institutions)).toBe(true);
  });
});
