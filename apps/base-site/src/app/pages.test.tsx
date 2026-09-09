import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HOME_IMAGE_SLOTS } from '@/content/home';
import { UNIVERSITIES_IMAGE_SLOTS } from '@/content/universities';
import { ALL_ROUTES, COUNTRY_SLUGS } from '@/content/routes';
import { internalPaths, renderPage } from '@/lib/page-harness';

import HomePage from './page';

/*
 * DestinationCounts is an async Server Component that calls the live registry.
 * React's client renderer — which is what RTL uses — cannot render async
 * components, and a marketing page test should not depend on a third party
 * being up. The section already returns null when the registry is
 * unreachable, so stubbing it here matches a real, supported state.
 */
vi.mock('@/sections/DestinationCounts', () => ({
  DestinationCounts: () => null,
}));

import NotFound from './not-found';
import AboutPage from './about/page';
import AgenciesPage from './agencies/page';
import ContactPage from './contact/page';
import DestinationsPage from './destinations/page';
import InstitutionsPage from './institutions/page';
import PrivacyPage from './privacy/page';
import StudentsPage from './students/page';
import TermsPage from './terms/page';

const PAGES = [
  ['/', <HomePage key="home" />, 'Your degree abroad,'],
  ['/students', <StudentsPage key="students" />, 'Find your perfect program'],
  ['/agencies', <AgenciesPage key="agencies" />, 'Grow your recruitment business'],
  ['/institutions', <InstitutionsPage key="institutions" />, 'Reach qualified students'],
  ['/destinations', <DestinationsPage key="destinations" />, 'Six countries'],
  ['/about', <AboutPage key="about" />, 'Transform'],
  ['/contact', <ContactPage key="contact" />, 'Tell us which side you are on'],
  ['/privacy', <PrivacyPage key="privacy" />, 'Privacy policy'],
  ['/terms', <TermsPage key="terms" />, 'Terms of service'],
  ['404', <NotFound key="404" />, 'We could not find that page'],
] as const;

describe.each(PAGES)('%s', (route, element, expectedHeading) => {
  it('renders exactly one h1, carrying the page title', () => {
    renderPage(element);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(new RegExp(expectedHeading, 'i'));
  });

  it('exposes banner, main and contentinfo landmarks', () => {
    renderPage(element);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('gives every image non-empty alt text', () => {
    const { container } = renderPage(element);
    const images = [...container.querySelectorAll('img')];
    for (const image of images) {
      expect(image.getAttribute('alt')?.trim(), image.getAttribute('src') ?? '').toBeTruthy();
    }
  });

  it('starts its heading order at h1 and never skips a level', () => {
    const { container } = renderPage(element);
    const levels = [...container.querySelectorAll('h1,h2,h3,h4')].map((h) =>
      Number(h.tagName.slice(1)),
    );
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!, `after h${levels[i - 1]}`).toBeLessThanOrEqual(1);
    }
  });

  it('links only to routes that exist', () => {
    const { container } = renderPage(element);
    const unknown = internalPaths(container).filter((path) => !ALL_ROUTES.includes(path));
    expect(unknown, `dead links on ${route}`).toEqual([]);
  });

  it('reaches every nav destination from the shared header', () => {
    renderPage(element);
    const banner = screen.getByRole('banner');
    for (const label of [
      'Students',
      'Agencies',
      'Institutions',
      'Explore',
      'Universities',
      'Destinations',
    ]) {
      expect(within(banner).getAllByRole('link', { name: label }).length).toBeGreaterThan(0);
    }
  });

  it('carries the legal links in the shared footer', () => {
    renderPage(element);
    const contentinfo = screen.getByRole('contentinfo');
    expect(within(contentinfo).getByRole('link', { name: 'Privacy policy' })).toBeInTheDocument();
    expect(within(contentinfo).getByRole('link', { name: 'Terms of service' })).toBeInTheDocument();
  });

  it('exposes no credential input on a public marketing page', () => {
    const { container } = renderPage(element);
    expect(container.querySelector('input[type="password"]')).not.toBeInTheDocument();
  });

  it('never references a Cloudinary URL', () => {
    const { container } = renderPage(element);
    expect(container.innerHTML).not.toMatch(/cloudinary/i);
  });
});

describe('image integrity', () => {
  it('does not use the photo 04b mislabelled as a campus courtyard', () => {
    /*
     * photo-1607013251379 loads with a 200 but is a photograph of a
     * cheeseburger, which 04b § 3.7 labels "Modern campus courtyard". A URL
     * returning 200 is not evidence the image is what the alt text claims, so
     * this pins the swap.
     */
    const sources = [...HOME_IMAGE_SLOTS, ...UNIVERSITIES_IMAGE_SLOTS].map((i) => i.src);
    expect(sources.some((src) => src.includes('photo-1607013251379'))).toBe(false);
  });

  it('gives every declared slot a non-empty alt and a search term', () => {
    for (const slot of [...HOME_IMAGE_SLOTS, ...UNIVERSITIES_IMAGE_SLOTS]) {
      expect(slot.alt.trim(), slot.slot).toBeTruthy();
      expect(slot.searchTerm.trim(), slot.slot).toBeTruthy();
    }
  });
});

describe('route coverage', () => {
  it('declares a route for every country slug', () => {
    for (const slug of COUNTRY_SLUGS) {
      expect(ALL_ROUTES).toContain(`/destinations/${slug}`);
    }
  });

  it('reaches every top-level route from the header or footer of any page', () => {
    const { container } = renderPage(<HomePage />);
    const reachable = new Set(internalPaths(container));

    for (const route of [
      '/students',
      '/agencies',
      '/institutions',
      '/universities',
      '/destinations',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
    ]) {
      expect(reachable, `${route} reachable from the shell`).toContain(route);
    }
  });
});
