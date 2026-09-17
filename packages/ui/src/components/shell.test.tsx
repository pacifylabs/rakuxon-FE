import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraduationCap, Search } from 'lucide-react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Breadcrumbs } from './Breadcrumbs';
import { ContactForm } from './ContactForm';
import { CountryFlag, flagEmoji } from './CountryFlag';
import { CountUp, parseFigure } from './CountUp';
import { FactGrid } from './FactGrid';
import { FilterBar } from './FilterBar';
import type { FilterDefinition } from './FilterBar';
import { ImageHero } from './ImageHero';
import { MediaSection } from './MediaSection';
import { PageHeader } from './PageHeader';
import { ValueProps } from './ValueProps';

const PHOTO = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80';

describe('<PageHeader/>', () => {
  it('renders its title as the page h1', () => {
    render(<PageHeader title="Explore universities" titleId="t" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Explore universities' }),
    ).toBeInTheDocument();
  });

  it('names its landmark from the heading', () => {
    render(<PageHeader title="Explore universities" titleId="t" />);
    expect(screen.getByRole('region', { name: 'Explore universities' })).toBeInTheDocument();
  });

  it('renders optional eyebrow and subcopy', () => {
    render(<PageHeader eyebrow="Browse" title="Explore" titleId="t" subcopy="No pressure." />);
    expect(screen.getByText('Browse')).toBeInTheDocument();
    expect(screen.getByText('No pressure.')).toBeInTheDocument();
  });
});

describe('<ImageHero/>', () => {
  const props = {
    title: 'Find your perfect program',
    titleId: 'hero',
    subcopy: 'Guided applications.',
    image: { src: PHOTO, alt: 'Students studying together at a table' },
  };

  it('renders the title as the page h1 and keeps the image alt', () => {
    render(<ImageHero {...props} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Find your perfect program',
    );
    expect(
      screen.getByRole('img', { name: 'Students studying together at a table' }),
    ).toBeInTheDocument();
  });

  it('renders both CTAs as real links', () => {
    render(
      <ImageHero
        {...props}
        primaryCta={{ label: 'Create account', href: '/contact' }}
        secondaryCta={{ label: 'How it works', href: '/#how-it-works' }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute(
      'href',
      '/#how-it-works',
    );
  });

  it('flips the columns without changing the markup order for assistive tech', () => {
    const { container } = render(<ImageHero {...props} imageSide="left" />);
    // The copy column still comes first in the DOM; only the visual order moves.
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelectorAll('.lg\\:order-2').length).toBeGreaterThan(0);
  });
});

describe('<MediaSection/>', () => {
  const props = {
    heading: 'Built for the way you work',
    headingId: 'media',
    body: 'Everything in one place.',
    image: { src: PHOTO, alt: 'Two colleagues reviewing work on a screen' },
  };

  it('renders as a named region with an h2', () => {
    render(<MediaSection {...props} />);
    expect(screen.getByRole('region', { name: 'Built for the way you work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Built for the way you work',
    );
  });

  it('renders its points and CTA', () => {
    render(
      <MediaSection
        {...props}
        points={['One place', 'Fewer emails']}
        cta={{ label: 'See more', href: '/agencies' }}
      />,
    );
    expect(screen.getByText('One place')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See more' })).toHaveAttribute('href', '/agencies');
  });
});

describe('<ValueProps/>', () => {
  it('renders every item with a heading', () => {
    render(
      <ValueProps
        items={[
          { icon: Search, title: 'Apply to many', description: 'One profile, many programs.' },
          { icon: GraduationCap, title: 'Track it', description: 'Real-time status.' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Apply to many' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Track it' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('<FactGrid/>', () => {
  const facts = [
    { label: 'Main intake', value: 'September' },
    { label: 'Tuition range', value: '£12,000 – £26,000' },
  ];

  it('renders label/value pairs as a description list', () => {
    const { container } = render(<FactGrid facts={facts} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(screen.getByText('Main intake')).toBeInTheDocument();
    expect(screen.getByText('£12,000 – £26,000')).toBeInTheDocument();
  });

  it('flags indicative figures in the markup without a visible caveat', () => {
    const { container } = render(<FactGrid facts={facts} sample />);
    expect(container.querySelector('[data-sample="true"]')).toBeInTheDocument();
    expect(screen.queryByText(/indicative/i)).not.toBeInTheDocument();
  });
});

describe('<Breadcrumbs/>', () => {
  it('renders a labelled nav with the current page marked', () => {
    render(
      <Breadcrumbs trail={[{ label: 'Destinations', href: '/destinations' }]} current="Canada" />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Destinations' })).toHaveAttribute(
      'href',
      '/destinations',
    );
    expect(within(nav).getByText('Canada')).toHaveAttribute('aria-current', 'page');
  });
});

describe('<FilterBar/>', () => {
  const filters: FilterDefinition[] = [
    { name: 'country', label: 'Country', options: ['Canada', 'United Kingdom'] },
    { name: 'level', label: 'Level', options: ['Undergraduate', 'Postgraduate'] },
  ];

  function Harness() {
    const [value, setValue] = useState<Record<string, string>>({});
    const matches = value.country === 'Canada' ? 1 : 4;
    return (
      <FilterBar
        filters={filters}
        value={value}
        onChange={setValue}
        onReset={() => setValue({})}
        resultCount={matches}
        resultNoun={{ one: 'university', other: 'universities' }}
      />
    );
  }

  it('gives every control a programmatic label', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Level')).toBeInTheDocument();
  });

  it('actually filters, and announces the new count', async () => {
    render(<Harness />);
    expect(screen.getByRole('status')).toHaveTextContent('4 universities');

    await userEvent.selectOptions(screen.getByLabelText('Country'), 'Canada');
    expect(screen.getByRole('status')).toHaveTextContent('1 university');
  });

  it('disables reset until something is actually filtered', async () => {
    render(<Harness />);
    const reset = screen.getByRole('button', { name: 'Clear filters' });
    expect(reset).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText('Country'), 'Canada');
    expect(reset).toBeEnabled();

    await userEvent.click(reset);
    expect(screen.getByRole('status')).toHaveTextContent('4 universities');
  });

  it('reports the chosen value to its owner', async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={filters}
        value={{}}
        onChange={onChange}
        resultCount={4}
        resultNoun={{ one: 'university', other: 'universities' }}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Level'), 'Postgraduate');
    expect(onChange).toHaveBeenCalledWith({ level: 'Postgraduate' });
  });
});

describe('<ContactForm/>', () => {
  const email = 'hello@rakuxon.com';

  it('labels every field', () => {
    render(<ContactForm fallbackEmail={email} />);
    expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('I am a')).toBeInTheDocument();
    expect(screen.getByLabelText('How can we help?')).toBeInTheDocument();
  });

  it('shows field errors linked by aria-describedby on an empty submit', async () => {
    render(<ContactForm fallbackEmail={email} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    const name = screen.getByLabelText('Your name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(name.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('rejects a malformed email', async () => {
    render(<ContactForm fallbackEmail={email} />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Amara');
    await userEvent.type(screen.getByLabelText('Email address'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('How can we help?'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('tells the truth on success: nothing was sent, here is the email', async () => {
    render(<ContactForm fallbackEmail={email} />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Amara');
    await userEvent.type(screen.getByLabelText('Email address'), 'amara@example.com');
    await userEvent.type(screen.getByLabelText('How can we help?'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/not connected yet/i);
    expect(status).toHaveTextContent(/were not sent anywhere/i);
    expect(screen.getByRole('link', { name: email })).toHaveAttribute('href', `mailto:${email}`);
  });

  it('pre-selects the role passed from the query string', () => {
    render(<ContactForm fallbackEmail={email} defaultRole="agency" />);
    expect(screen.getByLabelText('I am a')).toHaveValue('agency');
  });
});

describe('parseFigure', () => {
  it.each([
    ['100,000+', '', 100000, '+'],
    ['1,200+', '', 1200, '+'],
    ['150+', '', 150, '+'],
    ['4.8', '', 4.8, ''],
    ['£12,000', '£', 12000, ''],
    ['—', '', Number.NaN, '—'],
  ])('splits %s', (input, prefix, target, suffix) => {
    const parsed = parseFigure(input);
    expect(parsed.prefix).toBe(prefix);
    expect(parsed.suffix).toBe(suffix);
    if (Number.isNaN(target)) expect(parsed.target).toBeNaN();
    else expect(parsed.target).toBe(target);
  });
});

describe('<CountUp/>', () => {
  it('always keeps the true figure in the accessibility tree', () => {
    // Only a decorative copy animates; a screen reader must never be able to
    // read a half-counted number.
    const { container } = render(<CountUp value="100,000+" />);
    expect(container.querySelector('.sr-only')?.textContent).toBe('100,000+');
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('shows the final value immediately when motion is unwelcome', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);

    const { container } = render(<CountUp value="1,200+" />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('1,200+');
    matchMedia.mockRestore();
  });

  it('shows the final value when IntersectionObserver is missing', () => {
    const original = window.IntersectionObserver;
    // @ts-expect-error exercising the no-observer fallback
    delete window.IntersectionObserver;

    const { container } = render(<CountUp value="150+" />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('150+');

    window.IntersectionObserver = original;
  });

  it('leaves a non-numeric figure exactly as given', () => {
    const { container } = render(<CountUp value="Coming soon" />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('Coming soon');
  });
});

describe('<CountUp/> interpolation', () => {
  /*
   * Driven with a stubbed rAF and clock rather than watched in a browser: the
   * preview pane throttles requestAnimationFrame to about 1fps, which makes a
   * real 1.6s count look like a jump. This pins the maths instead.
   */
  function harness() {
    const frameCallbacks: FrameRequestCallback[] = [];
    let clock = 0;
    let trigger: IntersectionObserverCallback | null = null;

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          trigger = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frameCallbacks.push(cb);
      return frameCallbacks.length;
    });
    vi.spyOn(performance, 'now').mockImplementation(() => clock);

    return {
      enterView() {
        act(() => {
          trigger?.([{ isIntersecting: true } as IntersectionObserverEntry], null as never);
        });
      },
      advance(ms: number) {
        clock += ms;
        const pending = frameCallbacks.splice(0, frameCallbacks.length);
        act(() => {
          pending.forEach((cb) => cb(clock));
        });
      },
      restore() {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
      },
    };
  }

  const digits = (el: Element | null) => Number((el?.textContent ?? '').replace(/[^\d]/g, ''));

  it('passes through intermediate values instead of jumping to the total', () => {
    const h = harness();
    const { container } = render(<CountUp value="100,000+" duration={1000} />);
    const shown = () => container.querySelector('[aria-hidden="true"]');

    expect(shown()?.textContent).toBe('0+');

    h.enterView();
    h.advance(250);
    const quarter = digits(shown());
    expect(quarter).toBeGreaterThan(0);
    expect(quarter).toBeLessThan(100_000);

    h.advance(500);
    const later = digits(shown());
    expect(later).toBeGreaterThan(quarter);
    expect(later).toBeLessThan(100_000);

    h.advance(500);
    expect(shown()?.textContent).toBe('100,000+');
    h.restore();
  });

  it('lands on the exact figure, never an eased approximation', () => {
    const h = harness();
    const { container } = render(<CountUp value="1,500+" duration={800} />);
    h.enterView();
    h.advance(2000);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('1,500+');
    h.restore();
  });

  it('keeps a decimal figure to its own precision', () => {
    const h = harness();
    const { container } = render(<CountUp value="4.8" duration={500} />);
    h.enterView();
    h.advance(1000);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('4.8');
    h.restore();
  });
});

describe('flagEmoji', () => {
  it.each([
    ['IN', '\u{1F1EE}\u{1F1F3}'],
    ['GB', '\u{1F1EC}\u{1F1E7}'],
    ['us', '\u{1F1FA}\u{1F1F8}'],
    [' de ', '\u{1F1E9}\u{1F1EA}'],
  ])('turns %s into its flag', (code, expected) => {
    expect(flagEmoji(code)).toBe(expected);
  });

  it.each([undefined, '', 'X', 'USA', '12', 'U1'])('returns null for %s', (code) => {
    expect(flagEmoji(code)).toBeNull();
  });
});

describe('<CountryFlag/>', () => {
  it('renders the flag for a known country', () => {
    const { container } = render(<CountryFlag countryCode="IN" />);
    expect(container.textContent).toBe('\u{1F1EE}\u{1F1F3}');
  });

  it('is decorative, because the card already names the country in text', () => {
    const { container } = render(<CountryFlag countryCode="CA" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders nothing when the registry has no country', () => {
    // It used to draw a generic building icon here. That was worse than empty:
    // the same glyph repeated down a grid says nothing the heading has not
    // already said, and it reads as a real mark rather than as missing data.
    const { container } = render(<CountryFlag countryCode="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a malformed code as text rather than inventing a flag', () => {
    const { container } = render(<CountryFlag countryCode="ZZZ" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.textContent).toBe('ZZZ');
  });
});
