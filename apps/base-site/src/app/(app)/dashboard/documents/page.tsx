'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { ProgressBar } from '@rakuxon/ui';
import type { StudentDocument } from '@rakuxon/contract';

import { DocumentRow } from '@/components/dashboard/DocumentRow';
import { DOCUMENT_CATEGORIES, DOCUMENT_TYPE_META, DOCUMENT_TYPES } from '@/components/dashboard/documentTypes';

export default function DocumentsPage() {
  const client = useApiClient();
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDocuments(await client.listDocuments());
    } catch (error) {
      setLoadError(
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Could not load your documents. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleUploaded(document: StudentDocument) {
    setDocuments((current) => {
      const withoutPrevious = (current ?? []).filter((entry) => entry.id !== document.id);
      return [document, ...withoutPrevious];
    });
  }

  function handleDeleted(id: string) {
    setDocuments((current) => (current ?? []).filter((entry) => entry.id !== id));
  }

  const uploadedCount = documents?.filter((document) => document.status === 'uploaded').length ?? 0;

  return (
    <section aria-labelledby="documents-heading">
      <h1 id="documents-heading" className="font-heading text-3xl font-bold text-text">
        Documents
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Upload what applies to you. Institutions vary in what they ask for, so not every category
        here will be relevant to every application.
      </p>

      {documents && (
        <div className="mt-6 max-w-md">
          <ProgressBar
            label="Uploaded"
            percent={Math.round((uploadedCount / DOCUMENT_TYPES.length) * 100)}
          />
        </div>
      )}

      {loadError && (
        <p role="alert" className="mt-6 text-base text-danger">
          {loadError}
        </p>
      )}

      {!documents && !loadError && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {documents && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {DOCUMENT_CATEGORIES.map((category) => (
            <div key={category.id} className="flex flex-col gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-text">{category.label}</h2>
                <p className="mt-1 text-sm text-text-muted">{category.hint}</p>
              </div>

              <div className="flex flex-col gap-3">
                {category.types.map((type) => (
                  <DocumentRow
                    key={type}
                    type={type}
                    label={DOCUMENT_TYPE_META[type].label}
                    document={documents.find(
                      (document) => document.type === type && document.status === 'uploaded',
                    )}
                    onUploaded={handleUploaded}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
