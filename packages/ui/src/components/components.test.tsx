import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraduationCap, Search, ShieldCheck } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../theme/ThemeProvider';
import { AudienceCard } from './AudienceCard';
import { AvatarStack } from './AvatarStack';
import { Button } from './Button';
import { CapabilityCard } from './CapabilityCard';
import { CtaBand } from './CtaBand';
import { DestinationCard } from './DestinationCard';
import { EyebrowPill } from './EyebrowPill';
import { Footer } from './Footer';
import { Header } from './Header';
import { HeroFloatingCard } from './HeroFloatingCard';
import { LogoBar } from './LogoBar';
import { ProgressRing } from './ProgressRing';
import { SectionBand } from './SectionBand';
import { StatChip } from './StatChip';
import { StepItem } from './StepItem';
import { TestimonialCard } from './TestimonialCard';
import { TrustBadge } from './TrustBadge';
import { UniversityCard } from './UniversityCard';
import { Wordmark } from './Wordmark';

const PHOTO = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80';

describe('<Wordmark/>', () => {
  it('renders the brand name from tokens', () => {
    render(<Wordmark />);
    expect(screen.getByRole('link', { name: 'Rakuxon' })).toBeInTheDocument();
  });

  it('renders a one-word name undivided, with no dangling hyphen', () => {
    const { container } = render(<Wordmark />);
    expect(container.querySelector('text')?.textContent).toBe('Rakuxon');
    expect(container.querySelector('tspan')).not.toBeInTheDocument();
  });

  it('still paints an accent slice when a tenant name has one', () => {
    const { container } = render(
      <ThemeProvider tokens={{ brand: { name: 'Acme Study', nameAccentSuffix: 'Study' } }}>
        <Wordmark />
      </ThemeProvider>,
    );
    expect(container.querySelector('text')?.textContent).toBe('Acme-study');
    expect(container.querySelector('tspan')?.textContent).toBe('-study');
  });

  it('draws the lockup as an SVG that names the brand', () => {
    render(<Wordmark />);
    expect(screen.getByRole('img', { name: 'Rakuxon' })).toBeInTheDocument();
  });

  it('can render the strapline for the full lockup', () => {
    render(<Wordmark showTagline />);
    expect(screen.getByText('Where Minds Meet Maps.')).toBeInTheDocument();
  });

  it('follows a tenant brand-name override without any code change', () => {
    render(
      <ThemeProvider tokens={{ brand: { name: 'Acme Study', nameAccentSuffix: 'Study' } }}>
        <Wordmark />
      </ThemeProvider>,
    );
    expect(screen.getByRole('link', { name: 'Acme Study' })).toBeInTheDocument();
  });
});

describe('<Button/>', () => {
  it('renders a real button by default and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Get started</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('defaults to type=button so it never submits a surrounding form by accident', () => {
    render(<Button>Get started</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders a real link when given href', () => {
    render(<Button href="/register">Get started</Button>);
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register');
  });

  it.each([
    ['primary', 'bg-primary'],
    ['ghost', 'border-border'],
    ['accent', 'bg-accent-soft'],
  ] as const)('styles the %s variant from tokens', (variant, expected) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole('button')).toHaveClass(expected);
  });

  it('carries a visible focus ring and respects reduced motion', () => {
    render(<Button>Label</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring');
    expect(button).toHaveClass('motion-reduce:transition-none');
  });
});

describe('<EyebrowPill/>', () => {
  it('renders its text', () => {
    render(<EyebrowPill>Your journey starts here</EyebrowPill>);
    expect(screen.getByText('Your journey starts here')).toBeInTheDocument();
  });

  it('is not a heading, so it cannot disturb the document outline', () => {
    render(<EyebrowPill>Everything you need</EyebrowPill>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('<AvatarStack/>', () => {
  const avatars = [
    { src: `${PHOTO}#1`, alt: 'Student' },
    { src: `${PHOTO}#2`, alt: 'Student' },
    { src: `${PHOTO}#3`, alt: 'Student' },
  ];

  it('renders every avatar with alt text', () => {
    render(<AvatarStack avatars={avatars} />);
    expect(screen.getAllByRole('img', { name: 'Student' })).toHaveLength(3);
  });

  it('renders the social-proof caption', () => {
    render(<AvatarStack avatars={avatars} caption="Join 100,000+ students." />);
    expect(screen.getByText('Join 100,000+ students.')).toBeInTheDocument();
  });
});

describe('<ProgressRing/>', () => {
  it('exposes the value to assistive technology, not just the drawing', () => {
    render(<ProgressRing value={92} />);
    const bar = screen.getByRole('progressbar', { name: 'Match score' });
    expect(bar).toHaveAttribute('aria-valuenow', '92');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders the percentage as text', () => {
    render(<ProgressRing value={92} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it.each([
    [-20, '0'],
    [140, '100'],
  ])('clamps %s to %s', (input, expected) => {
    render(<ProgressRing value={input} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected);
  });
});

describe('<HeroFloatingCard/>', () => {
  it('renders its title and body', () => {
    render(
      <HeroFloatingCard title="Match Score">
        <p>Great match!</p>
      </HeroFloatingCard>,
    );
    expect(screen.getByRole('article', { name: 'Match Score' })).toBeInTheDocument();
    expect(screen.getByText('Match Score')).toBeInTheDocument();
    expect(screen.getByText('Great match!')).toBeInTheDocument();
  });

  it('renders an optional action link', () => {
    render(
      <HeroFloatingCard title="Match Score" action={{ label: 'View details', href: '#x' }}>
        <p>92%</p>
      </HeroFloatingCard>,
    );
    expect(screen.getByRole('link', { name: /View details/ })).toHaveAttribute('href', '#x');
  });

  it('marks sample data for code and for screen readers, without a visible badge', () => {
    const { container } = render(
      <HeroFloatingCard title="Match Score" sample>
        <p>92%</p>
      </HeroFloatingCard>,
    );
    expect(container.querySelector('[data-sample="true"]')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /sample data/i })).toBeInTheDocument();
  });

  it('introduces no heading, so the hero outline goes h1 straight to h2', () => {
    render(
      <HeroFloatingCard title="Match Score">
        <p>92%</p>
      </HeroFloatingCard>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('adds no sample marking when the data is real', () => {
    const { container } = render(
      <HeroFloatingCard title="Match Score">
        <p>92%</p>
      </HeroFloatingCard>,
    );
    expect(container.querySelector('[data-sample]')).not.toBeInTheDocument();
  });
});

describe('<LogoBar/>', () => {
  const logos = [
    { name: 'Northfield', emblem: 'shield' },
    { name: 'Westbrook', emblem: 'book' },
    { name: 'Lakeside', emblem: 'leaf' },
  ] as const;

  it('renders the label and every logo mark', () => {
    render(<LogoBar label="Trusted by students and partners worldwide" logos={logos} />);
    for (const logo of logos) {
      expect(screen.getByText(logo.name)).toBeInTheDocument();
    }
  });

  it('renders each partner as a drawn lockup, not bare text', () => {
    const { container } = render(<LogoBar label="Trusted worldwide" logos={logos} />);
    expect(container.querySelectorAll('svg')).toHaveLength(logos.length);
  });

  it('hides the decorative emblems from assistive technology', () => {
    const { container } = render(<LogoBar label="Trusted worldwide" logos={logos} />);
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

describe('<CapabilityCard/>', () => {
  const props = {
    icon: Search,
    title: 'Search & Match',
    description: 'Find programs that fit your profile.',
    action: { label: 'Search now', href: '/universities' },
  };

  it('renders title, description and arrow link', () => {
    render(<CapabilityCard {...props} />);
    expect(screen.getByRole('heading', { name: 'Search & Match' })).toBeInTheDocument();
    expect(screen.getByText('Find programs that fit your profile.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Search now/ })).toHaveAttribute(
      'href',
      '/universities',
    );
  });

  it.each([
    ['tone1', 'bg-tint-tone1-soft'],
    ['tone2', 'bg-tint-tone2-soft'],
    ['tone3', 'bg-tint-tone3-soft'],
    ['tone4', 'bg-tint-tone4-soft'],
    ['urgent', 'bg-tint-urgent-soft'],
  ] as const)('paints the %s tint from tokens', (tone, expected) => {
    const { container } = render(<CapabilityCard {...props} tone={tone} />);
    expect(container.querySelector(`.${expected.replace(/\./g, '\\.')}`)).toBeInTheDocument();
  });
});

describe('<StatChip/>', () => {
  it('renders value and label', () => {
    render(<StatChip icon={GraduationCap} value="100,000+" label="Students guided" />);
    expect(screen.getByText('100,000+')).toBeInTheDocument();
    expect(screen.getByText(/Students guided/)).toBeInTheDocument();
  });

  it('marks a sample figure in code and for screen readers', () => {
    const { container } = render(
      <StatChip icon={GraduationCap} value="100,000+" label="Students guided" sample />,
    );
    expect(container.querySelector('[data-sample="true"]')).toBeInTheDocument();
    expect(container.querySelector('.sr-only')?.textContent).toMatch(/sample data/i);
  });
});

describe('<CtaBand/>', () => {
  const props = {
    icon: GraduationCap,
    headingId: 'cta-heading',
    heading: 'Ready to start your journey?',
    subline: 'Join thousands of students.',
    cta: { label: 'Create free account', href: '/register' },
    reassurance: 'No credit card required.',
  };

  it('renders heading, subline, CTA and reassurance', () => {
    render(<CtaBand {...props} />);
    expect(
      screen.getByRole('heading', { name: 'Ready to start your journey?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Join thousands of students.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create free account' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.getByText('No credit card required.')).toBeInTheDocument();
  });

  it('puts inverse text on the indigo block so the one bold moment stays readable', () => {
    render(<CtaBand {...props} />);
    // on-primary, not text-inverse: it is text on a primary block, and the
    // token has to invert with the scheme for the dark palette to work.
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-on-primary');
  });
});

describe('image cards', () => {
  it('<DestinationCard/> links to its country page and keeps alt text', () => {
    render(
      <DestinationCard
        country="United Kingdom"
        src={PHOTO}
        alt="London skyline with Big Ben"
        href="/destinations/uk"
      />,
    );
    expect(screen.getByRole('link', { name: /United Kingdom/ })).toHaveAttribute(
      'href',
      '/destinations/uk',
    );
    expect(screen.getByRole('img', { name: 'London skyline with Big Ben' })).toBeInTheDocument();
  });

  it('<UniversityCard/> renders name and country', () => {
    render(
      <UniversityCard
        name="Northfield University"
        country="United Kingdom"
        src={PHOTO}
        alt="University campus building"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Northfield University' })).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('<AudienceCard/> exposes exactly one link, its CTA', () => {
    render(
      <AudienceCard
        title="Students"
        description="Apply with confidence."
        cta={{ label: 'Sign up', href: '/register' }}
        src={PHOTO}
        alt="Group of students together on campus"
      />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Sign up/ })).toHaveAttribute('href', '/register');
  });

  it('<TestimonialCard/> uses figure/blockquote semantics', () => {
    const { container } = render(
      <TestimonialCard
        quote="I got into my first choice."
        name="Amara"
        detail="Nigeria → Canada"
        src={PHOTO}
        alt="Portrait of a smiling student"
      />,
    );
    expect(container.querySelector('figure')).toBeInTheDocument();
    expect(container.querySelector('blockquote')).toBeInTheDocument();
    expect(container.querySelector('figcaption')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Portrait of a smiling student' })).toBeInTheDocument();
  });
});

describe('<StepItem/>', () => {
  it('renders the step number, title and description', () => {
    render(
      <ol>
        <StepItem step={2} title="Shortlist & apply" description="Pick your universities." />
      </ol>,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shortlist & apply' })).toBeInTheDocument();
  });
});

describe('<TrustBadge/>', () => {
  it('renders its label as a list item', () => {
    render(
      <ul>
        <TrustBadge icon={ShieldCheck} label="Confidential & trusted" />
      </ul>,
    );
    expect(screen.getByRole('listitem')).toHaveTextContent('Confidential & trusted');
  });
});

describe('<SectionBand/>', () => {
  it('renders a section landmark named by its heading', () => {
    render(
      <SectionBand labelledBy="how-heading">
        <h2 id="how-heading">How it works</h2>
      </SectionBand>,
    );
    expect(screen.getByRole('region', { name: 'How it works' })).toBeInTheDocument();
  });

  it.each([
    ['surface', 'bg-surface'],
    ['muted', 'bg-surface-muted'],
    ['soft', 'bg-accent-soft'],
    ['gradient', 'from-accent-soft'],
  ] as const)('applies the %s tone from tokens', (tone, expected) => {
    const { container } = render(
      <SectionBand tone={tone}>
        <p>body</p>
      </SectionBand>,
    );
    expect(container.querySelector('section')).toHaveClass(expected);
  });
});

describe('<Header/>', () => {
  const props = {
    navLinks: [
      { label: 'Students', href: '/students' },
      { label: 'Agencies', href: '/agencies' },
    ],
    logIn: { label: 'Log in', href: '/login' },
    getStarted: { label: 'Get started', href: '/register' },
  };

  it('renders the wordmark, nav and both CTAs', () => {
    render(<Header {...props} />);
    const banner = screen.getByRole('banner');
    expect(within(banner).getByRole('link', { name: 'Rakuxon' })).toBeInTheDocument();
    expect(within(banner).getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(within(banner).getByRole('link', { name: 'Get started' })).toBeInTheDocument();
  });

  it('keeps the mobile nav collapsed until the disclosure is pressed', () => {
    const { container } = render(<Header {...props} />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    // A hidden element drops out of the accessibility tree, so assert on the
    // node itself rather than querying it by role and name.
    expect(container.querySelector('#header-mobile-nav')).toHaveAttribute('hidden');
  });

  it('opens the mobile nav so every destination stays reachable on a phone', async () => {
    render(<Header {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    const toggle = screen.getByRole('button', { name: 'Close menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = screen.getByRole('navigation', { name: 'Primary mobile' });
    expect(mobileNav).not.toHaveAttribute('hidden');
    expect(within(mobileNav).getByRole('link', { name: 'Students' })).toBeInTheDocument();
  });

  it('closes the mobile nav after a destination is chosen', async () => {
    render(<Header {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Primary mobile' })).getByRole('link', {
        name: 'Students',
      }),
    );
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

describe('<Footer/>', () => {
  const props = {
    tagline: 'Your study abroad journey, simplified.',
    domain: 'rakuxon.com',
    columns: [
      { heading: 'Get to know us', links: [{ label: 'About', href: '/about' }] },
      { heading: 'Legal', links: [{ label: 'Privacy policy', href: '/privacy' }] },
    ],
    socials: [{ label: 'LinkedIn', href: '#linkedin' }],
  };

  it('renders a contentinfo landmark with each named column', () => {
    render(<Footer {...props} />);
    const contentinfo = screen.getByRole('contentinfo');
    expect(
      within(contentinfo).getByRole('navigation', { name: 'Get to know us' }),
    ).toBeInTheDocument();
    expect(within(contentinfo).getByRole('navigation', { name: 'Legal' })).toBeInTheDocument();
    expect(within(contentinfo).getByRole('navigation', { name: 'Social' })).toBeInTheDocument();
  });

  it('carries the legal links a document-handling product needs', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toBeInTheDocument();
  });

  it('takes the copyright name from tokens rather than hard-coding it', () => {
    render(
      <ThemeProvider tokens={{ brand: { name: 'Acme Study', nameAccentSuffix: 'Study' } }}>
        <Footer {...props} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/© \d{4} Acme\./);
  });
});
