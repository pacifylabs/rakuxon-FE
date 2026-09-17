import type { DocumentType } from '@rakuxon/contract';

/** Every document type the product knows about, labelled for the admin review screen. */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identity: 'International Passport',
  academic_certificate: 'Academic certificate',
  academic_transcript: 'Degree transcript',
  secondary_marksheet: 'Secondary marksheet',
  senior_secondary_marksheet: 'WAEC/NECO certificate',
  english_test: 'English test result',
  medical: 'Medical record',
  cv_resume: 'Updated CV/Resume',
  recommendation_letter: 'Letter of recommendation',
  research_proposal: 'Research proposal',
};

export const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[];
