'use client';

import { useSearchParams } from 'next/navigation';

import { ContactForm } from '@rakuxon/ui';

import { INTENT_TO_ROLE } from '@/content/contact';
import { CONTACT_EMAIL } from '@/content/site';

/**
 * Reads ?intent= so a "Get started" click from the header lands with the right
 * role already selected (see content/routes.ts).
 */
export function ContactPanel() {
  // Null when rendered outside a router context (tests, static export edge cases).
  const intent = useSearchParams()?.get('intent') ?? '';
  return (
    <ContactForm defaultRole={INTENT_TO_ROLE[intent] ?? 'student'} fallbackEmail={CONTACT_EMAIL} />
  );
}
