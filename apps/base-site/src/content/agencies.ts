import { BookOpenCheck, Coins, FileSearch, LayoutDashboard, Link2, Users } from 'lucide-react';

import type { ImageSlot } from './home';
import { ROUTES, SIGN_UP } from './routes';

/** /agencies — docs/04b § 5. Angle: operational leverage and margin. */

export const AGENCIES_HERO = {
  eyebrow: 'For recruitment partners',
  title: 'Grow your recruitment business, no platform fees.',
  subcopy:
    'You already know how to place students. What slows you down is chasing documents over WhatsApp, rebuilding the same profile for each university, and never quite knowing which applications are stuck. That is the part we take.',
  primaryCta: { label: 'Become a partner', href: SIGN_UP },
  secondaryCta: { label: 'See how it works', href: '#partner-workflow' },
  image: {
    src: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1400&q=80',
    alt: 'Team collaborating in a bright office',
    searchTerm: 'team office collaboration',
  } satisfies ImageSlot,
} as const;

export const AGENCY_VALUE_PROPS = [
  {
    icon: LayoutDashboard,
    tone: 'tone1' as const,
    title: 'Every student in one pipeline',
    description:
      'One board for the whole desk. See who is at enquiry, who is waiting on documents, and who has an offer sitting unaccepted.',
  },
  {
    icon: FileSearch,
    tone: 'tone2' as const,
    title: 'Document review with automated checks',
    description:
      'Problems are flagged before a counsellor opens the file, so review time goes on judgement calls rather than spotting a missing signature.',
  },
  {
    icon: Link2,
    tone: 'tone3' as const,
    title: 'Onboard students with one link',
    description:
      'Send a single invite. The student fills in their own profile and uploads their own documents, straight into your pipeline.',
  },
  {
    icon: Coins,
    tone: 'tone4' as const,
    title: 'Transparent commissions',
    description:
      'Rates and splits are configured, visible, and reconciled against a ledger you can read. No opaque deductions.',
  },
  {
    icon: Users,
    tone: 'tone1' as const,
    title: 'Your whole team, one view',
    description:
      'Counsellors, admins and owners see the same pipeline with permissions that match their role.',
  },
  {
    icon: BookOpenCheck,
    tone: 'tone2' as const,
    title: 'Training and support',
    description:
      'Onboarding for your counsellors, and a real person to talk to when an application does something unusual.',
  },
];

export const AGENCY_WORKFLOW = {
  eyebrow: 'The partner workspace',
  heading: 'Stop reconstructing the same student six times',
  body: 'A student profile is built once and reused across every application. Your counsellors work from the same record, so nobody is asking the student for a transcript that arrived last Tuesday.',
  points: [
    'One student record behind every application',
    'Review queues that show what actually needs a decision',
    'Status visible to you and the student at the same time',
  ],
  cta: { label: 'Talk to our partnerships team', href: ROUTES.contact },
  image: {
    src: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&q=80',
    alt: 'Two colleagues reviewing work on a screen',
    searchTerm: 'colleagues reviewing screen',
  } satisfies ImageSlot,
} as const;

export const AGENCY_BENEFITS = [
  {
    label: 'No platform fee',
    value: 'Nil',
    hint: 'You keep your commission. We do not charge for access to the platform.',
  },
  {
    label: 'Student onboarding',
    value: 'One link',
    hint: 'No manual data entry to add a student to your pipeline.',
  },
  {
    label: 'Institution network',
    value: 'Growing',
    hint: 'Partner institutions are vetted before they appear in the catalogue.',
  },
];

export const AGENCIES_CTA = {
  heading: 'Bring your desk onto one board',
  subline: 'Move your current students across and see the pipeline in an afternoon.',
  cta: { label: 'Join our network', href: SIGN_UP },
  reassurance: 'No platform fee. No minimum volume.',
} as const;

export const AGENCIES_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = [
  { slot: '/agencies hero', ...AGENCIES_HERO.image },
  { slot: '/agencies workflow', ...AGENCY_WORKFLOW.image },
];
