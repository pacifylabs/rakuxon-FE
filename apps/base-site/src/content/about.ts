import { Eye, HeartHandshake, ScrollText } from 'lucide-react';

import type { ImageSlot } from './home';
import { ROUTES, SIGN_UP } from './routes';

/** /about — docs/04b § 9. Angle: stewardship, and the model in plain words. */

export const ABOUT_HERO = {
  eyebrow: 'About us',
  title: 'Studying abroad should not depend on who you happen to know.',
  subcopy:
    'The information that decides an application — which documents matter, when the real deadline is, what a course actually costs — is not secret. It is just scattered, and the people who have it are not always the people who need it.',
  image: {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80',
    alt: 'Team working together in an office',
    searchTerm: 'team working office',
  } satisfies ImageSlot,
} as const;

export const ABOUT_STORY = {
  heading: 'Our story',
  body: 'Rakuxon started from a simple observation: the same three problems came up in every failed application. Documents that were not checked, deadlines nobody tracked, and a student and their counsellor working from different versions of the truth. None of those are hard problems. They are just nobody’s job.',
  points: [
    'Built around the application, not around the marketing funnel',
    'The student and the counsellor see the same record',
    'Nothing is hidden behind a call with a salesperson',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    alt: 'Colleagues talking around a table in a bright office',
    searchTerm: 'team meeting discussion',
  } satisfies ImageSlot,
} as const;

export const ABOUT_MODEL = [
  {
    title: 'Students',
    description:
      'Get a guided application, checks before submission, and a live view of every decision.',
    href: ROUTES.students,
  },
  {
    title: 'Agencies',
    description:
      'Run the whole desk on one board, onboard students with a link, and keep your commission.',
    href: ROUTES.agencies,
  },
  {
    title: 'Institutions',
    description: 'Receive complete, checked applications from partners who have been vetted first.',
    href: ROUTES.institutions,
  },
];

export const ABOUT_VALUES = [
  {
    icon: HeartHandshake,
    tone: 'tone1' as const,
    title: 'Stewardship',
    description:
      'We hold passports, transcripts and admissions outcomes for people who are often under eighteen. That is a responsibility before it is a product.',
  },
  {
    icon: Eye,
    tone: 'tone2' as const,
    title: 'Transparency',
    description:
      'Prices, commissions and application status are visible to the people they affect. No hidden deductions, and no number you cannot trace back to something real.',
  },
  {
    icon: ScrollText,
    tone: 'tone3' as const,
    title: 'Guidance, not gatekeeping',
    description:
      'Automated checks are decision support for a counsellor, never a verdict delivered to a student.',
  },
];

/* Figures per 04b § 3.4. Flagged in the markup via `data-sample`, not on screen. */
export const ABOUT_STATS = [
  { value: '100,000+', label: 'Students guided' },
  { value: '1,200+', label: 'Partner agencies' },
  { value: '1,500+', label: 'Institutions' },
  { value: '150+', label: 'Countries supported' },
];

export const ABOUT_CAREERS = {
  heading: 'Working here',
  body: 'We are small, and hiring slowly. If you have built admissions, compliance or document-handling systems and you care about getting them right rather than shipping them fast, we would like to hear from you.',
  cta: { label: 'Get in touch', href: ROUTES.contact },
} as const;

export const ABOUT_CTA = {
  heading: 'Come and build your journey with us',
  subline: 'Whether you are applying, placing students, or admitting them.',
  cta: { label: 'Get started', href: SIGN_UP },
  reassurance: 'No credit card required.',
} as const;

export const ABOUT_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = [
  { slot: '/about hero', ...ABOUT_HERO.image },
  { slot: '/about story', ...ABOUT_STORY.image },
];
