import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  Globe2,
  GraduationCap,
  Search,
  Send,
  Trophy,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { IconBubbleTone } from '@rakuxon/ui';

import { ROUTES, SIGN_UP, countryRoute } from './routes';

/**
 * Home page content (docs/04b § 3).
 *
 * Every image URL and every alt string is transcribed from the spec. Keeping
 * them here means the image checklist is one file, and a 403 swap is a
 * one-line change.
 */

export interface ImageSlot {
  src: string;
  alt: string;
  /** The spec's search term, for swapping a URL that 403s (docs/04b § 12). */
  searchTerm: string;
}

/* ---------------------------------------------------------------- § 3.1 hero */

export const HERO = {
  eyebrow: 'Your journey starts here',
  headlineLine1: 'Study abroad.',
  headlineLine2: 'Simplified.',
  subcopy:
    'Research, plan, apply, and track your international education — all in one place. Apply with confidence and turn your goals into offers.',
  primaryCta: { label: 'Get started', href: SIGN_UP },
  secondaryCta: { label: 'How it works', href: '#how-it-works' },
  socialProof: 'Join 100,000+ students who found their path.',
} as const;

export const HERO_FIGURE: ImageSlot = {
  src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
  alt: 'Smiling student ready to study abroad',
  searchTerm: 'happy student books',
};

export const HERO_AVATARS: readonly ImageSlot[] = [
  {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    alt: 'Student',
    searchTerm: 'student portrait woman',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    alt: 'Student',
    searchTerm: 'young man portrait',
  },
  {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    alt: 'Student',
    searchTerm: 'young woman portrait',
  },
];

/** Illustrative UI, not live data — rendered with `sample` (docs/04b § 3.1). */
export const HERO_MATCH_CARD = {
  title: 'Match Score',
  score: 92,
  verdict: 'Great match!',
  action: { label: 'View details', href: SIGN_UP },
} as const;

export const HERO_DEADLINE_CARD = {
  title: 'Application Deadline',
  countdown: '18 Days Left',
  university: 'University of Toronto',
  action: { label: 'View program', href: ROUTES.universities },
} as const;

/* ------------------------------------------------------------ § 3.2 logo bar */

/*
 * Partner lockups for our own example institutions. Real university logos are
 * trademarks and are not reproduced without permission — swap these for
 * licensed artwork once partnerships are signed.
 */
export const TRUST_BAR = {
  label: 'Trusted by students and partners worldwide',
  logos: [
    { name: 'Northfield', emblem: 'shield' },
    { name: 'Westbrook', emblem: 'book' },
    { name: 'Lakeside', emblem: 'leaf' },
    { name: 'Kingsbridge', emblem: 'tower' },
    { name: 'Ardenmoor', emblem: 'arch' },
    { name: 'Fairhaven', emblem: 'compass' },
  ],
} as const;

/* --------------------------------------------------- § 3.3 capability grid */

export interface CapabilityContent {
  icon: LucideIcon;
  tone: IconBubbleTone;
  title: string;
  description: string;
  action: { label: string; href: string };
}

export const CAPABILITIES: readonly CapabilityContent[] = [
  {
    icon: Search,
    tone: 'tone1',
    title: 'Search & Match',
    description: 'Find programs and universities that fit your profile, goals, and budget.',
    action: { label: 'Search now', href: ROUTES.universities },
  },
  {
    icon: FileCheck2,
    tone: 'tone2',
    title: 'Prepare & Apply',
    description: 'Build your profile, upload documents, and apply with confidence.',
    action: { label: 'Start applying', href: SIGN_UP },
  },
  {
    icon: CalendarCheck,
    /* The urgent tint earns its place: this card is about deadlines and reminders. */
    tone: 'urgent',
    title: 'Stay Organized',
    description: 'Track deadlines and get reminders so you never miss a step.',
    action: { label: 'Get organized', href: SIGN_UP },
  },
  {
    icon: Trophy,
    tone: 'tone4',
    title: 'Track & Achieve',
    description: 'Follow your admission status in real time, all the way to your offer.',
    action: { label: 'Track status', href: SIGN_UP },
  },
];

/* ---------------------------------------------------------- § 3.4 stat bar */

export interface StatContent {
  icon: LucideIcon;
  tone: IconBubbleTone;
  value: string;
  label: string;
}

export const STATS: readonly StatContent[] = [
  { icon: Users, tone: 'tone1', value: '100,000+', label: 'Students guided' },
  { icon: GraduationCap, tone: 'tone2', value: '1,500+', label: 'Universities' },
  /*
   * 04b § 3.4 asks for orange here, but the urgent tint is reserved for
   * deadlines and time pressure. Partner agencies is neither, so it takes a
   * neutral categorical tone and `urgent` keeps its signal value.
   */
  { icon: Building2, tone: 'tone3', value: '1,200+', label: 'Partner agencies' },
  { icon: Globe2, tone: 'tone4', value: '150+', label: 'Countries supported' },
];

/* ------------------------------------------------------ § 3.5 how it works */

export interface StepContent {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const STEPS: readonly StepContent[] = [
  {
    icon: ClipboardList,
    title: 'Build your profile',
    description: 'Add your grades, budget and goals once. We reuse them everywhere.',
  },
  {
    icon: Send,
    title: 'Shortlist & apply',
    description: 'Pick the universities that fit, then apply with your documents in order.',
  },
  {
    icon: Trophy,
    title: 'Track your admission',
    description: 'Watch every application move, from submitted to offer, in real time.',
  },
];

/* ---------------------------------------------------- § 3.6 destinations */

export interface DestinationContent extends ImageSlot {
  country: string;
  href: string;
}

export const DESTINATIONS: readonly DestinationContent[] = [
  {
    country: 'United Kingdom',
    href: countryRoute('uk'),
    src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    alt: 'Aerial view of London with Tower Bridge and the River Thames',
    searchTerm: 'london uk',
  },
  {
    country: 'Canada',
    href: countryRoute('canada'),
    src: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80',
    alt: 'Toronto city skyline',
    searchTerm: 'toronto canada',
  },
  {
    country: 'United States',
    href: countryRoute('usa'),
    src: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=80',
    alt: 'New York City skyline at sunset',
    searchTerm: 'new york city',
  },
  {
    country: 'Ireland',
    href: countryRoute('ireland'),
    src: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&q=80',
    alt: 'Dublin street and architecture',
    searchTerm: 'dublin ireland',
  },
  {
    country: 'Australia',
    href: countryRoute('australia'),
    src: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80',
    alt: 'Sydney Opera House and harbour',
    searchTerm: 'sydney australia',
  },
  {
    country: 'Germany',
    href: countryRoute('germany'),
    src: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    alt: 'Half-timbered houses on a street in a historic German town',
    searchTerm: 'berlin germany',
  },
];

/* ---------------------------------------------------- § 3.7 institutions */

export interface InstitutionContent extends ImageSlot {
  name: string;
  country: string;
}

export const INSTITUTIONS: readonly InstitutionContent[] = [
  {
    name: 'Northfield University',
    country: 'United Kingdom',
    src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    alt: 'University campus building',
    searchTerm: 'university campus',
  },
  {
    name: 'Westbrook College',
    country: 'Canada',
    src: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80',
    /* 04b called this "Historic university hall"; it is a modern building. */
    alt: 'Modern red-brick university building and plaza',
    searchTerm: 'university hall',
  },
  {
    name: 'Lakeside Institute',
    country: 'Australia',
    /*
     * 04b § 3.7 specified photo-1607013251379 as "Modern campus courtyard".
     * That URL loads fine but the photograph is a cheeseburger — the alt text
     * and the image did not match. Swapped and verified by eye.
     */
    src: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=800&q=80',
    alt: 'Campus walkway between two university buildings',
    searchTerm: 'campus courtyard',
  },
];

/* ---------------------------------------------------- § 3.8 testimonials */

export interface TestimonialContent extends ImageSlot {
  quote: string;
  name: string;
  detail: string;
}

export const TESTIMONIALS: readonly TestimonialContent[] = [
  {
    quote:
      'I had no idea where to start. Having every deadline and document in one place meant I could actually focus on my application instead of chasing paperwork.',
    name: 'Amara O.',
    detail: 'Nigeria → Canada',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    alt: 'Portrait of a smiling student',
    searchTerm: 'student portrait woman',
  },
  {
    quote:
      'The document checks caught two problems before I submitted. My counsellor and I could see exactly the same thing, which made the whole process far less stressful.',
    name: 'Daniel K.',
    detail: 'Kenya → United Kingdom',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    alt: 'Portrait of a smiling student',
    searchTerm: 'student portrait man',
  },
  {
    quote:
      'I was applying from a different timezone to every university on my list. Getting one reminder that actually reached me, instead of an email at 3am I would never see, is the reason I made two of those deadlines.',
    name: 'Priya S.',
    detail: 'India → Australia',
    src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
    alt: 'Portrait of a smiling student in a striped top',
    searchTerm: 'student portrait woman smiling',
  },
  {
    quote:
      'The budget breakdown was the part I did not expect. Seeing tuition, rent, visa and the deposit in one number told me which of my three choices was actually affordable.',
    name: 'Lucas M.',
    detail: 'Brazil → Ireland',
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    alt: 'Portrait of a student against a dark background',
    searchTerm: 'student portrait man',
  },
  {
    quote:
      'My counsellor and I stopped emailing each other attachments entirely. She could see what I had uploaded the moment I uploaded it, and I could see what she still needed.',
    name: 'Chen W.',
    detail: 'China → United Kingdom',
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    alt: 'Portrait of a smiling student in a denim jacket',
    searchTerm: 'student portrait woman',
  },
  {
    quote:
      'I got rejected from my first choice and genuinely did not know what to do next. Having the other four applications already moving meant it was a setback, not the end of it.',
    name: 'Yusuf B.',
    detail: 'Turkey → Germany',
    src: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
    alt: 'Portrait of a student wearing sunglasses',
    searchTerm: 'young man portrait',
  },
];

/* ------------------------------------------------- § 3.9 audience split */

export interface AudienceContent extends ImageSlot {
  title: string;
  description: string;
  cta: { label: string; href: string };
}

export const AUDIENCES: readonly AudienceContent[] = [
  {
    title: 'Students',
    description: 'Find your program, apply with confidence, and track every offer.',
    cta: { label: 'Sign up', href: SIGN_UP },
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    alt: 'Group of students together on campus',
    searchTerm: 'happy students group',
  },
  {
    title: 'Agencies',
    description: 'Run your whole student pipeline in one place, with no platform fees.',
    cta: { label: 'Become a partner', href: ROUTES.agencies },
    src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    alt: 'Advisor meeting with a client at a desk',
    searchTerm: 'business advisor meeting',
  },
  {
    title: 'Institutions',
    description: 'Reach qualified students worldwide through a vetted partner network.',
    cta: { label: 'Partner with us', href: ROUTES.institutions },
    src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    /* 04b § 3.9 called this a lecture hall; it is a commencement ceremony. */
    alt: 'Graduates throwing their caps at a commencement ceremony',
    searchTerm: 'university lecture hall',
  },
];

/* -------------------------------------------------- § 3.10 closing band */

export const CLOSING_CTA = {
  heading: 'Ready to start your journey?',
  subline: 'Join thousands of students turning their dream into an offer.',
  cta: { label: 'Create free account', href: SIGN_UP },
  reassurance: 'No credit card required.',
} as const;

/* ------------------------------------------------- course paths (browse) */

export interface CoursePath extends ImageSlot {
  title: string;
  description: string;
  /** Seeds the Explore search. */
  query: string;
}

/**
 * Entry points into the catalogue. Each is a real search, so the card leads
 * somewhere with results rather than to a dead-end landing page.
 */
export const COURSE_PATHS: readonly CoursePath[] = [
  {
    title: 'Get there',
    description:
      'Compare destinations on cost, course length and what you can do after you graduate.',
    query: 'tab=universities',
    src: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    alt: 'View from an aeroplane window above the clouds at sunset',
    searchTerm: 'airplane travel',
  },
  {
    title: 'Fund it',
    description:
      'Understand the real cost — tuition, living, visa, deposits — and what funding you qualify for.',
    query: 'tab=articles&q=scholarship',
    src: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
    alt: 'Stacks of coins with a young plant growing from them',
    searchTerm: 'scholarship funding savings',
  },
  {
    title: 'Plan the move',
    description: 'Intakes, deadlines and the documents each country asks for, in one place.',
    query: 'tab=articles&q=visa',
    src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    alt: 'Travel map with a backpack, camera and notebook laid out on top',
    searchTerm: 'travel planning map',
  },
  {
    title: 'Study together',
    description:
      'Find the programme that fits your grades, your budget and where you want to end up.',
    query: 'tab=courses',
    src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    alt: 'Group of students working together around a table with laptops',
    searchTerm: 'students collaborating',
  },
];

/** Every image slot on the page, for the load-verification checklist. */
export const HOME_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = [
  { slot: '§3.1 hero figure', ...HERO_FIGURE },
  ...HERO_AVATARS.map((image, index) => ({ slot: `§3.1 avatar ${index + 1}`, ...image })),
  ...DESTINATIONS.map((d) => ({ slot: `§3.6 ${d.country}`, ...d })),
  ...INSTITUTIONS.map((i) => ({ slot: `§3.7 ${i.name}`, ...i })),
  ...TESTIMONIALS.map((t) => ({ slot: `§3.8 ${t.name}`, ...t })),
  ...AUDIENCES.map((a) => ({ slot: `§3.9 ${a.title}`, ...a })),
  ...COURSE_PATHS.map((p) => ({ slot: `course path ${p.title}`, ...p })),
];
