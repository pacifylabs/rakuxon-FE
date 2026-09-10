import { CheckCircle2, Circle } from 'lucide-react';

import type { DocumentType } from '@rakuxon/contract';

import { DOCUMENT_TYPE_META, REQUIRED_DOCUMENT_TYPES } from './documentTypes';

export function RequiredDocumentsChecklist({ missing }: { missing: DocumentType[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {REQUIRED_DOCUMENT_TYPES.map((type) => {
        const satisfied = !missing.includes(type);
        return (
          <li key={type} className="flex items-center gap-3">
            {satisfied ? (
              <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-primary" />
            ) : (
              <Circle aria-hidden="true" className="size-5 shrink-0 text-text-muted" />
            )}
            <span className={satisfied ? 'text-text' : 'text-text-muted'}>
              {DOCUMENT_TYPE_META[type].label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
