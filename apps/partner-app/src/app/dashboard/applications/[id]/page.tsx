'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { ApplicationStatusBadge, Button, StatusBadge, useToast } from '@rakuxon/ui';
import type { AdminApplicationDetail, StudentDocument } from '@rakuxon/contract';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-1 text-base text-text">{value || '—'}</dd>
    </div>
  );
}

/** "academic_certificate" -> "Academic certificate" — no shared label table across apps. */
function humanize(type: string): string {
  const words = type.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Attach/detach an already-uploaded document only — no upload, no approve/
 * reject. Reviewing a student's own submissions stays a platform-admin
 * action; an agency should not be able to wave its own students through.
 */
export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { apiClient } = useAuth();
  const toast = useToast();

  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setApplication(await apiClient.getAgencyApplication(params.id));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this application. Please try again.',
      );
    }
  }, [apiClient, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDocuments = useCallback(async () => {
    if (!application) return;
    try {
      setDocuments(await apiClient.listAgencyStudentDocuments(application.studentId));
      setDocumentsError(null);
    } catch (caught) {
      setDocumentsError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this student’s documents. Please try again.',
      );
    }
  }, [apiClient, application]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function attach(documentId: string) {
    if (!application) return;
    setPendingDocumentId(documentId);
    try {
      setApplication(await apiClient.attachAgencyApplicationDocument(application.id, documentId));
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not attach that document. Please try again.',
      );
    } finally {
      setPendingDocumentId(null);
    }
  }

  async function detach(documentId: string) {
    if (!application) return;
    setPendingDocumentId(documentId);
    try {
      setApplication(await apiClient.detachAgencyApplicationDocument(application.id, documentId));
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not detach that document. Please try again.',
      );
    } finally {
      setPendingDocumentId(null);
    }
  }

  async function submit() {
    if (!application) return;
    setSubmitting(true);
    try {
      setApplication(await apiClient.submitAgencyApplication(application.id));
      toast.success('Application submitted.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not submit this application. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !application) {
    return (
      <section>
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
        <Button
          variant="ghost"
          size="md"
          className="mt-4"
          onClick={() => router.push('/dashboard/applications')}
        >
          Back to applications
        </Button>
      </section>
    );
  }

  if (!application) {
    return (
      <p role="status" className="text-base text-text-muted">
        Loading…
      </p>
    );
  }

  /** An upload on file, of a still-missing type, not yet attached here. */
  function unattachedUploadOf(type: string): StudentDocument | undefined {
    return documents?.find(
      (entry) =>
        entry.type === type &&
        (entry.status === 'uploaded' || entry.status === 'approved') &&
        !application?.attachedDocumentIds.includes(entry.id),
    );
  }

  return (
    <section aria-labelledby="application-heading">
      <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/applications')}>
        ← Back to applications
      </Button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 id="application-heading" className="font-heading text-3xl font-bold text-text">
          {application.courseTitle}
        </h1>
        <ApplicationStatusBadge status={application.status} />
      </div>
      <p className="mt-2 text-base text-text-muted">{application.institutionName}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <dl className="grid gap-6">
          <Field label="Student" value={application.studentName} />
          <Field label="Student email" value={application.studentEmail} />
        </dl>

        <dl className="grid gap-6">
          <Field label="Assigned to" value={application.assignedAdminName ?? '—'} />
          <Field label="Created" value={new Date(application.createdAt).toLocaleString()} />
          <Field
            label="Submitted"
            value={
              application.submittedAt ? new Date(application.submittedAt).toLocaleString() : ''
            }
          />
        </dl>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl font-semibold text-text">Documents</h2>
          {application.readyToSubmit ? (
            <StatusBadge tone="positive">Ready to submit</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Not yet ready</StatusBadge>
          )}
          {application.status === 'draft' && application.readyToSubmit && (
            <Button variant="primary" size="md" disabled={submitting} onClick={submit}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </Button>
          )}
        </div>

        <p className="mt-2 text-sm text-text-muted">
          {application.attachedDocumentIds.length} document
          {application.attachedDocumentIds.length === 1 ? '' : 's'} attached.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}
        {documentsError && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {documentsError}
          </p>
        )}

        {application.missingDocumentTypes.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-text">Still missing</p>
            <p className="mt-1 text-sm text-text-muted">
              Not yet approved — including anything attached below that's still pending review.
            </p>

            <div className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
              {application.missingDocumentTypes.map((type) => {
                const existing = unattachedUploadOf(type);

                return (
                  <div key={type} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-heading text-sm font-semibold text-text">
                        {humanize(type)}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        {existing ? `On file: ${existing.originalFilename}` : 'Not uploaded yet.'}
                      </p>
                    </div>
                    {existing && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={pendingDocumentId === existing.id}
                        onClick={() => attach(existing.id)}
                      >
                        {pendingDocumentId === existing.id ? 'Attaching…' : 'Attach'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {application.attachedDocumentIds.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text">Attached</p>
            <ul className="mt-2 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
              {application.attachedDocumentIds.map((documentId) => {
                const entry = documents?.find((doc) => doc.id === documentId);

                return (
                  <li
                    key={documentId}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <p className="text-sm text-text">
                        {entry ? humanize(entry.type) : documentId}
                        {entry ? ` — ${entry.originalFilename}` : ''}
                      </p>
                      {entry && (
                        <StatusBadge tone={entry.status === 'approved' ? 'positive' : 'neutral'}>
                          {entry.status}
                        </StatusBadge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="md"
                      disabled={pendingDocumentId === documentId}
                      onClick={() => detach(documentId)}
                    >
                      {pendingDocumentId === documentId ? 'Detaching…' : 'Detach'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
