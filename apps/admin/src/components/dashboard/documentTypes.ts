import type { DocumentType } from '@rakuxon/contract';

/** Every document type the product knows about, labelled for the admin review screen. */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identity: 'Identity',
  academic_certificate: 'Academic certificate',
  secondary_marksheet: 'Secondary marksheet',
  senior_secondary_marksheet: 'Senior secondary marksheet',
  english_test: 'English test result',
  medical: 'Medical record',
};

export const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[];
