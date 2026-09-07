'use client';

import { useSearchParams } from 'next/navigation';

import { ContactForm } from '@rakuxon/ui';

import { INTENT_TO_ROLE } from '@/content/contact';
import { courseRoute, universityRoute } from '@/content/routes';
import { CONTACT_EMAIL } from '@/content/site';
import { findCourseBySlug, findInstitutionBySlug } from '@/lib/catalogue/bank';

/**
 * Reads the query string so a click from anywhere lands with context.
 *
 * `intent` picks the role. `course` and `university` carry what the visitor
 * pressed "Proceed to apply" on, so registration opens knowing it — the slug
 * is resolved back to a real record here rather than echoed, which means a
 * stale or invented slug shows nothing instead of a broken claim.
 */
export function ContactPanel() {
  // Null when rendered outside a router context (tests, static export edges).
  const params = useSearchParams();
  const intent = params?.get('intent') ?? '';

  const course = findCourseBySlug(params?.get('course') ?? '');
  const institution = findInstitutionBySlug(params?.get('university') ?? '');

  const selection = course
    ? {
        label: `${course.title} — ${course.institutionName}`,
        href: courseRoute(course.slug),
        value: `course:${course.slug}`,
      }
    : institution
      ? {
          label: institution.name,
          href: universityRoute(institution.slug),
          value: `university:${institution.slug}`,
        }
      : null;

  return (
    <ContactForm
      defaultRole={INTENT_TO_ROLE[intent] ?? 'student'}
      fallbackEmail={CONTACT_EMAIL}
      selection={selection}
      defaultMessage={
        selection ? `I would like to apply for ${selection.label}.` : undefined
      }
    />
  );
}
