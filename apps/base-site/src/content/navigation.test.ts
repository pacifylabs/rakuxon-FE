import { describe, expect, it } from 'vitest';

import { ROUTES } from './routes';
import { buildDestinationLinks, buildFooterColumns, buildNavLinks } from './site';

/* A mix of a country with a written guide and one without, so both href
   shapes `buildDestinationLinks` can produce are exercised. */
const FIXTURE_DESTINATIONS = [
  { countryCode: 'GB', country: 'United Kingdom' },
  { countryCode: 'KE', country: 'Kenya' },
];
const destinationLinks = buildDestinationLinks(FIXTURE_DESTINATIONS);
const navLinks = buildNavLinks(destinationLinks);
const labels = navLinks.map((link) => link.label);
const destinations = navLinks.find((link) => link.label === 'Destinations');
const footerLinks = buildFooterColumns(destinationLinks).flatMap((column) => column.links);

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

    expect(countries?.length).toBe(FIXTURE_DESTINATIONS.length);
    for (const country of countries ?? []) {
      expect(country.countryCode).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('links a country with a written guide to it, and any other enabled country to the filtered catalogue', () => {
    expect(destinations?.children).toContainEqual({
      label: 'United Kingdom',
      href: '/destinations/uk',
      countryCode: 'GB',
    });
    expect(destinations?.children).toContainEqual({
      label: 'Kenya',
      href: '/universities?country=KE',
      countryCode: 'KE',
    });
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
    expect(navLinks.some((link) => link.href === ROUTES.explore)).toBe(false);
  });

  it('keeps the institutions page reachable from the footer it left the bar for', () => {
    expect(navLinks.some((link) => link.href === ROUTES.institutions)).toBe(false);
    expect(footerLinks.some((link) => link.href === ROUTES.institutions)).toBe(true);
  });
});
