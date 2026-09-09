import { ROUTES } from './routes';

/**
 * /resources — the guidance library.
 *
 * The articles themselves live in the database, not here. This file holds only
 * the framing copy around them, so an editor publishing a new piece never has
 * to touch the frontend.
 */

export const RESOURCES_HEADER = {
  eyebrow: 'Guidance',
  title: 'The parts nobody explains until you get them wrong',
  subcopy:
    'Written by our advisors from the applications they actually handle. Where a figure matters — fees, funds, deadlines — we point you at the authority that publishes it rather than quoting a number that changes every year.',
} as const;

/** Shown when a tag filter matches nothing, so the page is never just blank. */
export const RESOURCES_EMPTY = {
  heading: 'Nothing under that filter yet.',
  body: 'The library is growing. Clear the filter to see everything we have published.',
} as const;

export const RESOURCES_CTA = {
  heading: 'Reading is not the same as being advised',
  subline:
    'These articles cover what is true in general. An advisor can tell you what is true for your grades, your budget and your passport — and that conversation costs nothing.',
  cta: { label: 'Book a free consultation', href: ROUTES.contact },
  reassurance: 'No obligation. No fee for the first conversation.',
} as const;

export const ARTICLE_CTA = {
  heading: 'Want this checked against your own situation?',
  subline:
    'Every rule here has exceptions that depend on your nationality, your course and the month you apply. An advisor will tell you which ones apply to you.',
  cta: { label: 'Talk to an advisor', href: ROUTES.contact },
  reassurance: 'Free, and you are not signing up to anything by asking.',
} as const;
