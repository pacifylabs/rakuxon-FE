import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@rakuxon/ui';

import {
  AUDIENCES,
  TRUST_BAR,
  CAPABILITIES,
  DESTINATIONS,
  HERO,
  HOME_IMAGE_SLOTS,
  INSTITUTIONS,
  STATS,
  STEPS,
  TESTIMONIALS,
} from '@/content/home';
import { CLOSING_CTA } from '@/content/home';
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

function renderHome() {
  return render(
    <ThemeProvider>
      <main>
        <HomePage />
      </main>
    </ThemeProvider>,
  );
}

describe('home page structure', () => {
  it('renders exactly one h1', () => {
    renderHome();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('leads with the two-line hero headline', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Your degree abroad,guided end to end.',
    );
  });

  it('renders the 04b section headings in spec order', () => {
    renderHome();
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual([
      // Search now lives inside the hero, so the first h2 is the course paths.
      'Where do you want to start?',
      'Your study abroad journey, simplified.',
      'Rakuxon by the numbers',
      'How it works',
      'Popular destinations',
      'Explore leading institutions',
      'Students who found their path',
      'Start your journey with us',
      'Ready to start your journey?',
    ]);
  });
});

describe('§3.1 hero', () => {
  it('renders both CTAs as real links', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      HERO.primaryCta.href,
    );
    expect(screen.getByRole('link', { name: /How it works/ })).toHaveAttribute(
      'href',
      HERO.secondaryCta.href,
    );
  });

  it('renders the avatar social proof', () => {
    renderHome();
    expect(screen.getAllByRole('img', { name: 'Student' })).toHaveLength(3);
    expect(
      screen.getByText("Join 2,500+ students and travellers we've guided."),
    ).toBeInTheDocument();
  });

  it('carries the real Rakuxon Ltd tagline as the eyebrow', () => {
    renderHome();
    expect(screen.getByText('Where Minds Meet Maps')).toBeInTheDocument();
  });

  it('draws the backdrop as an SVG, not a photograph', () => {
    // The hero no longer sits on a photo: text contrast used to depend on
    // which slide happened to be showing, which is not a thing you can hold
    // to AA. An inline SVG is theme-aware, weightless, and needs no JS.
    const { container } = renderHome();
    const hero = container.querySelector('[aria-labelledby="hero-heading"]');

    expect(hero?.querySelector('svg')).toBeInTheDocument();
    expect(hero?.querySelectorAll('img')).toHaveLength(3); // the avatar stack only
  });

  it('keeps the backdrop out of the accessibility tree', () => {
    const { container } = renderHome();
    const backdrop = container.querySelector(
      '[aria-labelledby="hero-heading"] [data-testid="hero-backdrop"]',
    );

    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    expect(backdrop?.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it('animates only when motion is welcome', () => {
    // The arcs travel; a vestibular-sensitive visitor should get them still.
    // Guarding inside the SVG's own <style> means it works with no client JS.
    const { container } = renderHome();
    const style = container.querySelector('[data-testid="hero-backdrop"] style');

    expect(style?.textContent).toContain('prefers-reduced-motion: no-preference');
  });

  it('paints the backdrop from tokens, never a hard-coded hex', () => {
    const { container } = renderHome();
    const backdrop = container.querySelector('[data-testid="hero-backdrop"]');

    expect(backdrop?.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(backdrop?.innerHTML).toContain('var(--color-');
  });
});

describe('landing page search', () => {
  it('offers a search form that submits to the explore hub', () => {
    renderHome();
    const form = screen.getByRole('search');
    expect(form).toHaveAttribute('action', '/explore');
    // GET, so the results page reproduces from the query string alone and the
    // form works before hydration.
    expect(form).toHaveAttribute('method', 'get');
  });

  it('labels every control and names the fields the explore page reads', () => {
    renderHome();
    const query = screen.getByLabelText('Search courses, universities and guidance');
    expect(query).toHaveAttribute('name', 'q');
    expect(query).toHaveAttribute('role', 'combobox');
    expect(query).toHaveAttribute('aria-expanded', 'false');
    expect(query).toHaveAttribute('aria-controls');
    expect(screen.getByLabelText('Type')).toHaveAttribute('name', 'tab');
    expect(screen.getByLabelText('Destination')).toHaveAttribute('name', 'country');
  });

  it('offers every explore tab as a search type', () => {
    renderHome();
    const options = [...screen.getByLabelText('Type').querySelectorAll('option')].map(
      (option) => option.value,
    );
    expect(options).toEqual(['courses', 'universities', 'articles']);
  });
});

describe('§3.2 trust logo bar', () => {
  it('renders each partner as a drawn lockup rather than bare text', () => {
    const { container } = renderHome();
    const bar = container.querySelector('[data-trust-bar]') as HTMLElement;
    expect(bar).toBeInTheDocument();
    expect(bar.querySelectorAll('svg').length).toBe(TRUST_BAR.logos.length);
  });

  it('carries no visible placeholder caveat', () => {
    renderHome();
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
  });
});

describe('§3.3 capability grid', () => {
  it('renders all four capabilities with their arrow links', () => {
    renderHome();
    for (const capability of CAPABILITIES) {
      expect(screen.getByRole('heading', { name: capability.title })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: new RegExp(capability.action.label) }),
      ).toHaveAttribute('href', capability.action.href);
    }
  });

  it('gives each card a different tint, per the reference grid', () => {
    const tones = new Set(CAPABILITIES.map((capability) => capability.tone));
    expect(tones.size).toBe(CAPABILITIES.length);
  });
});

describe('§3.4 stat bar', () => {
  it('renders every stat', () => {
    const { container } = renderHome();
    // Each figure appears twice: the accessible copy of record, and an
    // aria-hidden copy that counts up. Assert the one screen readers get.
    const announced = [...container.querySelectorAll('.sr-only')].map((el) => el.textContent);
    for (const stat of STATS) {
      expect(announced).toContain(stat.value);
    }
  });

  it('counts each figure up from zero without risking a half-read number', () => {
    const { container } = renderHome();
    const bar = container.querySelector('[aria-labelledby="stats-heading"]') as HTMLElement;

    for (const stat of STATS) {
      const announced = [...bar.querySelectorAll('.sr-only')].find(
        (el) => el.textContent === stat.value,
      );
      expect(announced, `accessible copy of ${stat.value}`).toBeTruthy();
      // The true value is never the animated node.
      expect(announced?.nextElementSibling).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('marks every figure as sample data so no invented number reads as measured', () => {
    const { container } = renderHome();
    const marked = container.querySelectorAll('[data-sample="true"]');
    // 4 stat chips + institutions list + testimonials list
    expect(marked.length).toBe(STATS.length + 2);
  });

  it('reserves the urgent tint for time pressure, not decoration', () => {
    // The deadline countdown and the "Stay Organized" card are the only places
    // the urgent tint appears; the stat bar takes neutral categorical tones
    // where 04b § 3.4 suggested orange.
    expect(STATS.every((stat) => stat.tone !== 'urgent')).toBe(true);
    expect(CAPABILITIES.filter((c) => c.tone === 'urgent')).toHaveLength(1);
  });
});

describe('§3.5 how it works', () => {
  it('renders the three steps in an ordered list', () => {
    const { container } = renderHome();
    const list = container.querySelector('#how-it-works ol');
    const items = within(list as HTMLElement).getAllByRole('listitem');
    expect(items).toHaveLength(STEPS.length);
    expect(items[0]).toHaveTextContent('Build your profile');
  });
});

describe('§3.6 popular destinations', () => {
  it('renders all six countries, each linking to its destination page', () => {
    renderHome();
    for (const destination of DESTINATIONS) {
      expect(screen.getByRole('link', { name: new RegExp(destination.country) })).toHaveAttribute(
        'href',
        destination.href,
      );
    }
  });

  it('uses the spec alt text for each destination photo', () => {
    renderHome();
    for (const destination of DESTINATIONS) {
      expect(screen.getByRole('img', { name: destination.alt })).toBeInTheDocument();
    }
  });
});

describe('§3.7 institutions', () => {
  it('renders each campus card', () => {
    renderHome();
    for (const institution of INSTITUTIONS) {
      expect(screen.getByRole('heading', { name: institution.name })).toBeInTheDocument();
    }
  });
});

describe('§3.8 testimonials', () => {
  it('renders each quote with its attributed name', () => {
    const { container } = renderHome();
    // The marquee renders the list twice to make the loop seamless; the seam
    // copy is aria-hidden, so assert against the announced list only.
    const announced = container.querySelector(
      '[data-testimonial-marquee] ul:not([aria-hidden])',
    ) as HTMLElement;

    for (const testimonial of TESTIMONIALS) {
      expect(within(announced).getByText(testimonial.quote)).toBeInTheDocument();
      expect(within(announced).getByText(testimonial.name)).toBeInTheDocument();
    }
  });

  it('hides the seam copy from assistive technology so quotes are heard once', () => {
    const { container } = renderHome();
    const lists = container.querySelectorAll('[data-testimonial-marquee] ul');
    expect(lists).toHaveLength(2);
    expect(lists[1]).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('§3.9 audience split', () => {
  it('renders all three audiences with their CTAs', () => {
    renderHome();
    for (const audience of AUDIENCES) {
      expect(screen.getByRole('heading', { name: audience.title })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: new RegExp(audience.cta.label) })).toHaveAttribute(
        'href',
        audience.cta.href,
      );
    }
  });
});

describe('§3.10 closing CTA band', () => {
  it('renders the heading, CTA and reassurance line', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { name: 'Ready to start your journey?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create free account' })).toHaveAttribute(
      'href',
      CLOSING_CTA.cta.href,
    );
    expect(screen.getByText('No credit card required.')).toBeInTheDocument();
  });
});

describe('images', () => {
  it('gives every image non-empty alt text', () => {
    renderHome();
    for (const image of screen.getAllByRole('img')) {
      expect(image.getAttribute('alt')?.trim()).toBeTruthy();
    }
  });

  it('renders one image per declared slot', () => {
    // Excludes the marquee's aria-hidden seam copy, which deliberately repeats
    // the testimonial portraits to make the loop continuous.
    const { container } = renderHome();
    const shown = [...container.querySelectorAll('img')].filter(
      (image) => !image.closest('[aria-hidden="true"]'),
    );
    expect(shown).toHaveLength(HOME_IMAGE_SLOTS.length);
  });

  it('serves every photo from an allow-listed remote host', () => {
    for (const image of HOME_IMAGE_SLOTS) {
      expect(image.src).toMatch(/^https:\/\/images\.(unsplash|pexels)\.com\//);
    }
  });

  it('repeats a photo only in the two places 04b itself assigns it twice', () => {
    /*
     * 04b § 12 says no image may be reused across different meanings, but the
     * spec's own slot table still collides once after the hero figure was
     * dropped:
     *   photo-1494790108377 → § 3.1 avatar 1  AND § 3.8 first testimonial
     * We ship the URLs as specified, and this test pins the collision so a
     * second one cannot creep in unnoticed. See the image checklist.
     */
    const bare = HOME_IMAGE_SLOTS.map((image) => image.src.split('?')[0]);
    const duplicated = [...new Set(bare.filter((src, i) => bare.indexOf(src) !== i))].sort();

    expect(duplicated).toEqual(['https://images.unsplash.com/photo-1494790108377-be9c29b29330']);
  });

  it('records a search term for every slot, so a 403 can be swapped fast', () => {
    for (const image of HOME_IMAGE_SLOTS) {
      expect(image.searchTerm.trim()).toBeTruthy();
    }
  });
});

describe('public-page security rules', () => {
  it('never references a Cloudinary URL', () => {
    const { container } = renderHome();
    expect(container.innerHTML).not.toMatch(/cloudinary/i);
  });

  it('renders no credential input on the public page', () => {
    renderHome();
    expect(document.querySelector('input[type="password"]')).not.toBeInTheDocument();
  });
});
