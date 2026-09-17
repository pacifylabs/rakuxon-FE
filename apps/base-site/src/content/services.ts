import { Compass, GraduationCap, Headphones, PlaneTakeoff, Send, Stamp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * /services page-framing copy. The services themselves are admin-authored —
 * see `lib/services/api.ts` — this file only keeps the copy that wraps the
 * fetched list, plus the fixed icon set the admin editor picks `iconName`
 * from (icons cannot be stored as data, so the API sends a name and this map
 * resolves it back to a component).
 */

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Compass,
  GraduationCap,
  Stamp,
  PlaneTakeoff,
  Headphones,
  Send,
};

export function resolveServiceIcon(iconName: string): LucideIcon {
  return SERVICE_ICONS[iconName] ?? Compass;
}

export const SERVICES_HERO = {
  eyebrow: 'Our services',
  title: 'From the first question to the first day on campus.',
  subcopy:
    'Eleven years of guiding students and travellers: consultancy, applications, visas, travel, arrival and everything after. The consultancy is free, and it is where almost everyone starts.',
} as const;

export const SERVICES_CTA = {
  heading: 'Not sure which you need?',
  body: 'The first conversation costs nothing. Tell us where you want to go and we will tell you what it actually takes.',
  ctaLabel: 'Book a free consultation',
  ctaHref: '/contact',
  reassurance: 'No fee for the initial consultancy.',
} as const;
