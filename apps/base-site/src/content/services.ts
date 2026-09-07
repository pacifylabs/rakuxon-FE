import {
  GraduationCap,
  Headphones,
  PlaneTakeoff,
  Send,
  Stamp,
  Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ROUTES } from './routes';

/**
 * /services — the six real Rakuxon Ltd services.
 *
 * Descriptions are transcribed verbatim from rakuxon.com. They are the
 * company's own words about its own offer, and paraphrasing them would put
 * marketing claims in our voice that nobody at Rakuxon signed off.
 */

export interface ServiceContent {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  description: string;
  /** Education or travel — the two halves of the business. */
  strand: 'education' | 'travel';
}

export const SERVICES: readonly ServiceContent[] = [
  {
    id: 'free-consultancy',
    icon: Compass,
    title: 'Free Educational Consultancy',
    summary: 'Where every journey starts, at no cost.',
    description:
      'Complimentary expert guidance in choosing the right universities and courses that align with your academic goals and career aspirations.',
    strand: 'education',
  },
  {
    id: 'university-applications',
    icon: GraduationCap,
    title: 'University Selection & Application',
    summary: 'The whole application, managed.',
    description:
      'Comprehensive support in selecting the perfect educational institutions and managing the entire application process with precision and care.',
    strand: 'education',
  },
  {
    id: 'visa-support',
    icon: Stamp,
    title: 'Visa Application Support',
    summary: 'Documentation, interview prep, submission.',
    description:
      'Navigate complex visa requirements with our experienced team. We provide comprehensive assistance with documentation, interview preparation, and application submission.',
    strand: 'education',
  },
  {
    id: 'pre-departure',
    icon: PlaneTakeoff,
    title: 'Pre-departure & Arrival Support',
    summary: 'Landing somewhere new, with someone expecting you.',
    description:
      'Complete pre-departure and arrival services including accommodation assistance, airport transfers, job opportunity guidance, workplace advice, and cultural orientation.',
    strand: 'education',
  },
  {
    id: 'ongoing-support',
    icon: Headphones,
    title: 'Ongoing Client Support',
    summary: 'We do not stop at the offer letter.',
    description:
      "Continuous support throughout your academic and travel journey. We're here to help with any challenges you face while studying or traveling abroad.",
    strand: 'education',
  },
  {
    id: 'travels-tourism',
    icon: Send,
    title: 'Travels and Tourism',
    summary: 'The other half of the business.',
    description:
      'Affordable luxury travel packages, flight booking, hotel reservations, and vacation planning. Experience the world with our expertly crafted travel solutions.',
    strand: 'travel',
  },
];

export const SERVICES_HERO = {
  eyebrow: 'Our services',
  title: 'From the first question to the first day on campus.',
  subcopy:
    'Eleven years of guiding students and travellers — consultancy, applications, visas, travel, arrival and everything after. The consultancy is free, and it is where almost everyone starts.',
} as const;

export const SERVICES_CTA = {
  heading: 'Not sure which you need?',
  body: 'The first conversation costs nothing. Tell us where you want to go and we will tell you what it actually takes.',
  ctaLabel: 'Book a free consultation',
  ctaHref: ROUTES.contact,
  reassurance: 'No fee for the initial consultancy.',
} as const;
