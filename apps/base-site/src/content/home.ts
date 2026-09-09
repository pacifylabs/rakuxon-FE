import {
  CalendarCheck,
  ClipboardList,
  FileCheck2,
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
  /* The real Rakuxon Ltd tagline (docs/04b § 0). The headline stays concrete
     underneath it: on its own the tagline is evocative but does not say what
     the company does, and the h1 is the line search engines read. */
  eyebrow: 'Where Minds Meet Maps',
  headlineLine1: 'Your degree abroad,',
  headlineLine2: 'guided end to end.',
  subcopy:
    'Eleven years guiding students from Lagos, Accra, Nairobi and Doha to universities worldwide — now with the platform to match. Search courses, apply, and track every step.',
  primaryCta: { label: 'Get started', href: SIGN_UP },
  secondaryCta: { label: 'How it works', href: '#how-it-works' },
  /* Real figure (§ 0: 2,500+ students & travellers), not the invented 100,000+. */
  socialProof: "Join 2,500+ students and travellers we've guided.",
  /* The consultancy's own span, echoing the six services in § 0. */
  journey: ['Free consultancy', 'Application & visa', 'Arrival support'],
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
  /* Example institutions, not real partners — see InstitutionLogo. The bar
     carries data-sample so it is greppable before launch. */
  logos: [
    { name: 'Northfield', emblem: 'shield', kind: 'University', founded: 1894 },
    { name: 'Westbrook', emblem: 'book', kind: 'College', founded: 1921 },
    { name: 'Lakeside', emblem: 'leaf', kind: 'Institute', founded: 1968 },
    { name: 'Kingsbridge', emblem: 'tower', kind: 'University', founded: 1855 },
    { name: 'Ardenmoor', emblem: 'arch', kind: 'University', founded: 1902 },
    { name: 'Fairhaven', emblem: 'compass', kind: 'Academy', founded: 1977 },
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
  /*
   * Rakuxon Ltd's real figures (rakuxon.com). These replace invented
   * placeholders — 100,000+ students, 1,500+ universities — which were flagged
   * as sample data precisely because nobody had measured them.
   *
   * "Partner universities" is the consultancy's own partnership count. It is
   * NOT the size of the platform catalogue, which will be far larger; the two
   * must never be presented as the same number.
   */
  { icon: Users, tone: 'tone1', value: '2,500+', label: 'Students & travellers' },
  { icon: GraduationCap, tone: 'tone2', value: '200+', label: 'Partner universities' },
  { icon: CalendarCheck, tone: 'tone3', value: '11+', label: 'Years experience' },
  /*
   * 04b § 3.4 asks for orange somewhere in this bar, but the urgent tint is
   * reserved for deadlines and time pressure. A success rate is neither.
   */
  { icon: Trophy, tone: 'tone4', value: '95%', label: 'Success rate' },
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

/**
 * A real, named client. No `src`: rakuxon.com shows these six as initials, and
 * putting a stock portrait beside a real person's name and university
 * misrepresents them. TestimonialCard renders initials when there is no photo.
 */
export interface TestimonialContent {
  quote: string;
  name: string;
  detail: string;
}

export const TESTIMONIALS: readonly TestimonialContent[] = [
  {
    quote:
      'Rakuxon Ltd made my dream of studying at Oxford University come true. Their guidance through the application process was invaluable, and their support never wavered. Truly where minds meet maps!',
    name: 'Sarah Adebayo',
    detail: 'Oxford University, UK',
  },
  {
    quote:
      "From university admission to travel arrangements, Rakuxon Ltd handled everything perfectly. I'm now studying at MIT and had amazing travel experiences during breaks, all thanks to their comprehensive services.",
    name: 'Michael Okafor',
    detail: 'MIT, USA',
  },
  {
    quote:
      "Rakuxon Ltd didn't just help me get into the University of Toronto, they also arranged my pre-departure travel and arrival support. Their travel services are exceptional — truly professional in every way.",
    name: 'Fatima Kone',
    detail: 'University of Toronto, Canada',
  },
  {
    quote:
      'The free consultation at Rakuxon Ltd was incredibly detailed and helpful. They took time to understand my goals and provided personalized recommendations. Their expertise made all the difference in my successful application to Cambridge.',
    name: 'David Adamu',
    detail: 'Cambridge University, UK',
  },
  {
    quote:
      "Rakuxon Ltd planned our honeymoon to Dubai, and it was beyond perfect. From airport pickup to luxury hotel bookings and desert tours, everything was seamless. We'll definitely book with them again!",
    name: 'Amaka & Chinedu Eze',
    detail: 'Dubai, UAE',
  },
  {
    quote:
      'As a solo traveller, I was nervous about exploring Europe. But Rakuxon Ltd arranged my itinerary across Paris, Rome, and Barcelona — with every hotel, flight, and activity perfectly planned. I felt safe and stress-free the entire time.',
    name: 'Tomiwa Adedeji',
    detail: 'Europe Tour',
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
    cta: { label: 'Partner with us', href: ROUTES.agencies },
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
  ...HERO_AVATARS.map((image, index) => ({ slot: `§3.1 avatar ${index + 1}`, ...image })),
  ...DESTINATIONS.map((d) => ({ slot: `§3.6 ${d.country}`, ...d })),
  ...INSTITUTIONS.map((i) => ({ slot: `§3.7 ${i.name}`, ...i })),
  ...AUDIENCES.map((a) => ({ slot: `§3.9 ${a.title}`, ...a })),
  ...COURSE_PATHS.map((p) => ({ slot: `course path ${p.title}`, ...p })),
];
