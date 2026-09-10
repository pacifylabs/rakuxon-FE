import type { DocumentType } from '@rakuxon/contract';

/**
 * Every document type the product knows about, with what the documents page
 * shows for it. The single source both the documents page (upload rows) and
 * an application's checklist (required subset) read from, so the two screens
 * cannot drift into describing a type differently.
 */
export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string; hint: string }> = {
  identity: { label: 'Identity', hint: 'Passport or national ID.' },
  academic_certificate: { label: 'Academic certificate', hint: 'Degree or diploma certificate.' },
  secondary_marksheet: { label: 'Secondary marksheet', hint: 'Final-year school results.' },
  senior_secondary_marksheet: {
    label: 'Senior secondary marksheet',
    hint: 'Where your system has a separate senior stage.',
  },
  english_test: { label: 'English test result', hint: 'IELTS, TOEFL or equivalent.' },
  medical: { label: 'Medical record', hint: 'Only where your chosen course requires one.' },
};

export const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_META) as DocumentType[];

/** Mirrors the backend's REQUIRED_DOCUMENT_TYPES — what every submission needs. */
export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
  'identity',
  'academic_certificate',
  'english_test',
];

/**
 * The documents page groups types by category and explains the category
 * once, rather than repeating similar wording on every row — one sentence of
 * "why this matters" per group instead of six.
 */
export const DOCUMENT_CATEGORIES: { id: string; label: string; hint: string; types: DocumentType[] }[] = [
  {
    id: 'identity',
    label: 'Identity',
    hint: 'Submit a valid ID to verify who you are.',
    types: ['identity'],
  },
  {
    id: 'academic',
    label: 'Academic records',
    hint: 'Secure admission to your best-matching courses by submitting accurate, complete records.',
    types: ['academic_certificate', 'secondary_marksheet', 'senior_secondary_marksheet'],
  },
  {
    id: 'english',
    label: 'English proficiency',
    hint: 'Most institutions ask for proof of English ability from international applicants.',
    types: ['english_test'],
  },
  {
    id: 'medical',
    label: 'Medical',
    hint: 'Only where your chosen course or destination requires one.',
    types: ['medical'],
  },
];
