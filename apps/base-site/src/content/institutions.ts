import { ClipboardCheck, Globe2, ShieldCheck, UserCheck, Users, Zap } from 'lucide-react';

import type { ImageSlot } from './home';
import { ROUTES, SIGN_UP } from './routes';

/** /institutions — the university/institution side of the network, mirroring /agencies. */

export const INSTITUTIONS_HERO = {
  eyebrow: 'For universities and institutions',
  title: 'Reach qualified students, without the noise.',
  subcopy:
    'Every application that reaches you comes from an agency we have vetted, built on a profile the student filled in once and reused everywhere. Less time screening applicants who were never eligible, more time on the ones who are.',
  primaryCta: { label: 'Partner with us', href: SIGN_UP },
  secondaryCta: { label: 'See how it works', href: '#institution-workflow' },
  image: {
    src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=80',
    alt: 'University campus building with students walking outside',
    searchTerm: 'university campus building',
  } satisfies ImageSlot,
} as const;

export const INSTITUTION_VALUE_PROPS = [
  {
    icon: Globe2,
    tone: 'tone1' as const,
    title: 'A wider, vetted recruitment channel',
    description:
      'Your programmes are visible to agencies and students across every market we operate in, without opening a recruitment office in each one.',
  },
  {
    icon: ShieldCheck,
    tone: 'tone2' as const,
    title: 'Every agency vetted before they recruit for you',
    description:
      'Recruitment partners are reviewed before they appear in the network, so the applications reaching you come through a channel you can trust.',
  },
  {
    icon: ClipboardCheck,
    tone: 'tone3' as const,
    title: 'Complete files, not partial ones',
    description:
      'Documents and profile data are collected from the student up front, so a file reaches you ready for a decision rather than a chase for what is missing.',
  },
  {
    icon: Zap,
    tone: 'tone4' as const,
    title: 'Set your own requirements and intakes',
    description:
      'Entry requirements, intakes and document checklists are yours to configure: what your admissions team actually asks for, not a generic template.',
  },
  {
    icon: Users,
    tone: 'tone1' as const,
    title: 'One view across every agency sending you students',
    description:
      'See applications from every recruitment partner in one place, instead of a different inbox and spreadsheet per agency.',
  },
  {
    icon: UserCheck,
    tone: 'tone2' as const,
    title: 'A named contact on our side',
    description:
      'Onboarding for your admissions team, and a real person to talk to when an application or a partner needs attention.',
  },
];

export const INSTITUTION_WORKFLOW = {
  eyebrow: 'The institution workspace',
  heading: 'Decisions on complete files, not incomplete ones',
  body: 'A student profile and its documents are built once, on the student\'s side, and carried into every application. Your admissions team reviews what is actually there, not a placeholder waiting on a transcript.',
  points: [
    'Requirements and intakes configured by your team, not ours',
    'Every application traceable to the agency and student behind it',
    'Decisions communicated back to the student and their agency together',
  ],
  cta: { label: 'Talk to our partnerships team', href: ROUTES.contact },
  image: {
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
    alt: 'Admissions staff reviewing documents at a desk',
    searchTerm: 'university admissions office review',
  } satisfies ImageSlot,
} as const;

export const INSTITUTION_BENEFITS = [
  {
    label: 'Platform fee',
    value: 'Nil',
    hint: 'Joining the network and receiving applications costs nothing.',
  },
  {
    label: 'Agency network',
    value: 'Vetted',
    hint: 'Recruitment partners are reviewed before they can submit to you.',
  },
  {
    label: 'Requirements',
    value: 'Yours to set',
    hint: 'Entry requirements, intakes and checklists are configured by your admissions team.',
  },
];

export const INSTITUTIONS_CTA = {
  heading: 'Open a channel that sends you complete applications',
  subline: 'Tell us about your programmes and intakes, and we will get your admissions team set up.',
  cta: { label: 'Partner with us', href: SIGN_UP },
  reassurance: 'No platform fee. No minimum volume.',
} as const;

export const INSTITUTIONS_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = [
  { slot: '/institutions hero', ...INSTITUTIONS_HERO.image },
  { slot: '/institutions workflow', ...INSTITUTION_WORKFLOW.image },
];
