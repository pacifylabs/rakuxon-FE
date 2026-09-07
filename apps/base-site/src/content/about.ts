import { Eye, HeartHandshake, ScrollText } from 'lucide-react';

import type { ImageSlot } from './home';
import { ROUTES, SIGN_UP } from './routes';

/** /about — docs/04b § 9. Angle: stewardship, and the model in plain words. */

export const ABOUT_HERO = {
  eyebrow: 'About Rakuxon Ltd',
  title: 'Transforming dreams into global reality.',
  subcopy:
    'A global education consultancy headquartered in London, with operations across Nigeria, Ghana, Kenya and Qatar. Eleven years connecting students with accredited universities in the UK, USA, Canada and Europe — from the first consultation to the visa in hand.',
  image: {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80',
    alt: 'Team working together in an office',
    searchTerm: 'team working office',
  } satisfies ImageSlot,
} as const;

export const ABOUT_STORY = {
  heading: 'Our story',
  body: 'Rakuxon Ltd is a leading global education consultancy headquartered in London, UK, with established operations across Nigeria, Ghana, Kenya and Qatar. Eleven years in, the approach has not changed: student-centric, end to end, and starting with a consultation that costs nothing. The platform came later, built on the same observation that made the consultancy work — the information that decides an application is not secret, just scattered.',
  points: [
    'Headquartered in London, operating across four countries',
    'Student-centric from consultation through to visa',
    'The consultancy is free, and it is where almost everyone starts',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    alt: 'Colleagues talking around a table in a bright office',
    searchTerm: 'team meeting discussion',
  } satisfies ImageSlot,
} as const;

/**
 * Verbatim from rakuxon.com. Quoted rather than paraphrased: these are the
 * company's own formal statements, and rewording them in our voice would put
 * words in Rakuxon's mouth that nobody there approved.
 */
export const ABOUT_VISION_MISSION = {
  heading: 'Vision and mission',
  items: [
    {
      icon: Eye,
      title: 'Our vision',
      body: 'To become the premier global bridge connecting dreams with destinations, empowering individuals to explore, learn, and achieve without limits.',
    },
    {
      icon: ScrollText,
      title: 'Our mission',
      body: 'To deliver trusted, personalized, and innovative educational consultancy and travel services, transforming aspirations into achievements through expert guidance, exceptional service, and unwavering commitment to client success.',
    },
    {
      icon: HeartHandshake,
      title: 'Brand essence',
      body: 'Where Minds Meet Maps — we combine deep understanding of client needs with expert knowledge of global opportunities.',
    },
  ],
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
/** Rakuxon Ltd's real figures — kept in step with home.ts STATS. */
export const ABOUT_STATS = [
  { value: '2,500+', label: 'Students & travellers' },
  { value: '200+', label: 'Partner universities' },
  { value: '11+', label: 'Years experience' },
  { value: '95%', label: 'Success rate' },
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
