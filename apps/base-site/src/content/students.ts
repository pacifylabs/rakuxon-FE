import { BellRing, FileCheck2, Layers, LineChart, PiggyBank, ShieldCheck } from 'lucide-react';

import type { ImageSlot } from './home';
import { ROUTES, SIGN_UP } from './routes';

/** /students — docs/04b § 4. Angle: the fear is getting it wrong, not ambition. */

export const STUDENTS_HERO = {
  eyebrow: 'For students',
  title: 'Find your perfect program and get in.',
  subcopy:
    'Most people do not lose a place because they aimed too high. They lose it to a missing transcript, a deadline in another timezone, or a personal statement nobody checked. Rakuxon closes those gaps.',
  primaryCta: { label: 'Create a student account', href: SIGN_UP },
  secondaryCta: { label: 'Browse universities', href: ROUTES.universities },
  image: {
    src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1400&q=80',
    alt: 'Students studying together at a table',
    searchTerm: 'students studying table',
  } satisfies ImageSlot,
} as const;

export const STUDENT_VALUE_PROPS = [
  {
    icon: Layers,
    tone: 'tone1' as const,
    title: 'Apply to several programs at once',
    description:
      'Fill in your profile once. Reuse it across every application instead of retyping the same details into six different portals.',
  },
  {
    icon: FileCheck2,
    tone: 'tone2' as const,
    title: 'Document checks before you submit',
    description:
      'We flag the things that get applications returned: an unsigned transcript, a passport that expires mid-course, a name that does not match across documents.',
  },
  {
    icon: LineChart,
    tone: 'tone3' as const,
    title: 'Track your admission in real time',
    description:
      'See exactly where each application sits, from submitted to decision, without emailing anyone to ask.',
  },
  {
    icon: PiggyBank,
    tone: 'tone4' as const,
    title: 'Scholarship and budget guidance',
    description:
      'Understand the real cost: tuition, living, visa, deposits, and which funding you actually qualify for before you commit.',
  },
];

export const STUDENT_PREVIEW = {
  eyebrow: 'Your upload centre',
  heading: 'Everything in one place, so nothing goes missing',
  body: 'Upload a document once and it is available to every application that needs it. You can see what is still outstanding, what is under review, and what has been accepted, without keeping a spreadsheet of your own life.',
  points: [
    'One checklist per application, always current',
    'Clear "under review" and "accepted" states, not silence',
    'Your counsellor sees exactly what you see',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    alt: 'Laptop showing a dashboard on a desk',
    searchTerm: 'laptop dashboard desk',
  } satisfies ImageSlot,
} as const;

export const STUDENT_STEPS = [
  {
    title: 'Build your profile',
    description: 'Grades, budget, and where you want to end up. Once, properly.',
  },
  {
    title: 'Upload your documents',
    description: 'Transcripts, passport, test scores. We check them before they matter.',
  },
  {
    title: 'Shortlist what fits',
    description: 'Programs matched to your profile, not a list of the famous ones.',
  },
  {
    title: 'Apply',
    description: 'Submit with everything attached and nothing missing.',
  },
  {
    title: 'Track your decision',
    description: 'Watch it move. Get told when something needs you.',
  },
];

export const STUDENT_REASSURANCE = [
  { icon: ShieldCheck, label: 'Your documents stay confidential' },
  { icon: BellRing, label: 'Deadline reminders that reach you' },
  { icon: FileCheck2, label: 'Checked before submission' },
];

export const STUDENTS_CTA = {
  heading: 'Your application, without the guesswork',
  subline: 'Build a profile in ten minutes and see which programs actually fit.',
  cta: { label: 'Create a student account', href: SIGN_UP },
  reassurance: 'Free for students. No credit card required.',
} as const;

export const STUDENTS_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = [
  { slot: '/students hero', ...STUDENTS_HERO.image },
  { slot: '/students upload preview', ...STUDENT_PREVIEW.image },
];
