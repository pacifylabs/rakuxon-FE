'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { ApplicationStatusBadge, Button, DropzoneUploader, useToast } from '@rakuxon/ui';
import type { Application, DocumentType, StudentDocument } from '@rakuxon/contract';

import { DOCUMENT_TYPE_META, REQUIRED_DOCUMENT_TYPES } from '@/components/dashboard/documentTypes';

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useApiClient();
  const toast = useToast();

  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [app, docs] = await Promise.all([
        client.getApplication(params.id),
        client.listDocuments(),
      ]);
      setApplication(app);
      setDocuments(docs);
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error, 'Could not load this application. Please try again.'));
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function attach(documentId: string, label: string) {
    if (!application) return;
    setPendingDocumentId(documentId);
    try {
      setApplication(await client.attachDocumentToApplication(application.id, documentId));
      toast.success(`${label} attached.`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not attach that document. Please try again.'));
    } finally {
      setPendingDocumentId(null);
    }
  }

  async function detach(documentId: string, label: string) {
    if (!application) return;
    setPendingDocumentId(documentId);
    try {
      setApplication(await client.detachDocumentFromApplication(application.id, documentId));
      toast.success(`${label} detached.`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not detach that document. Please try again.'));
    } finally {
      setPendingDocumentId(null);
    }
  }

  /**
   * Upload and attach in one step: a required document a student has never
   * uploaded before has no reason to make them leave this page, upload on
   * the general Documents screen, then come back to attach it.
   */
  async function uploadAndAttach(type: DocumentType, file: File) {
    if (!application) return;
    setUploadingType(type);
    try {
      const signature = await client.getUploadSignature({ type, filename: file.name });

      const form = new FormData();
      form.set('file', file);
      form.set('api_key', signature.apiKey);
      form.set('timestamp', String(signature.timestamp));
      form.set('signature', signature.signature);
      form.set('public_id', signature.publicId);

      const uploadResponse = await fetch(signature.uploadUrl, { method: 'POST', body: form });
      const uploadBody = (await uploadResponse.json()) as {
        secure_url?: string;
        bytes?: number;
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadBody.secure_url) {
        throw new Error(uploadBody.error?.message ?? 'The upload did not complete.');
      }

      const confirmed = await client.confirmDocumentUpload(signature.documentId, {
        secureUrl: uploadBody.secure_url,
        bytes: uploadBody.bytes ?? file.size,
        mimeType: file.type || 'application/octet-stream',
      });
      setDocuments((current) => [
        confirmed,
        ...(current ?? []).filter((doc) => doc.id !== confirmed.id),
      ]);
      setApplication(await client.attachDocumentToApplication(application.id, confirmed.id));
      toast.success(`${DOCUMENT_TYPE_META[type].label} uploaded and attached.`);
    } catch (error) {
      toast.error(
        errorMessage(
          error instanceof Error ? error : null,
          'Could not upload that file. Please try again.',
        ),
      );
    } finally {
      setUploadingType(null);
    }
  }

  async function handleSubmit() {
    if (!application) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      setApplication(await client.submitApplication(application.id));
      toast.success('Application submitted.');
    } catch (error) {
      const message = errorMessage(error, 'Could not submit this application. Please try again.');
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <section aria-labelledby="application-heading">
        <h1 id="application-heading" className="font-heading text-3xl font-bold text-text">
          Application
        </h1>
        <p role="alert" className="mt-4 text-base text-danger">
          {loadError}
        </p>
      </section>
    );
  }

  if (!application || !documents) {
    return (
      <section aria-labelledby="application-heading">
        <h1 id="application-heading" className="font-heading text-3xl font-bold text-text">
          Application
        </h1>
        <p role="status" className="mt-4 text-base text-text-muted">
          Loading…
        </p>
      </section>
    );
  }

  const submitted = application.status === 'submitted';

  return (
    <section aria-labelledby="application-heading">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="application-heading" className="font-heading text-3xl font-bold text-text">
          Application {application.id.slice(0, 8)}
        </h1>
        <ApplicationStatusBadge status={application.status} />
      </div>

      {submitted ? (
        <>
          <p className="mt-4 max-w-prose text-base text-text-muted">
            Submitted{' '}
            {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : ''}.
            Review and offer updates will appear here once available.
          </p>
          {application.assignedAdminName && (
            <p className="mt-4 max-w-prose text-base text-text">
              Your success manager: <span className="font-semibold">{application.assignedAdminName}</span>
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-4 max-w-prose text-base text-text-muted">
            Attach each required document — upload it here, or attach one already on file. An
            admissions team member reviews each one before you can submit.
          </p>

          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-text">Required documents</h2>

            <div className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
              {REQUIRED_DOCUMENT_TYPES.map((type) => {
                const label = DOCUMENT_TYPE_META[type].label;
                const attachedDocument = documents.find(
                  (doc) => doc.type === type && application.attachedDocumentIds.includes(doc.id),
                );

                if (attachedDocument) {
                  const attachedApproved = attachedDocument.status === 'approved';
                  const attachedRejected = attachedDocument.status === 'rejected';

                  return (
                    <div
                      key={type}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {attachedApproved ? (
                          <CheckCircle2
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-primary"
                          />
                        ) : attachedRejected ? (
                          <XCircle
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-danger"
                          />
                        ) : (
                          <Clock
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-warning"
                          />
                        )}
                        <div>
                          <p className="font-heading text-sm font-semibold text-text">{label}</p>
                          <p className="mt-1 text-sm text-text-muted">
                            {attachedDocument.originalFilename}
                            {!attachedApproved && !attachedRejected ? ' · Pending review' : ''}
                          </p>
                          {attachedRejected && attachedDocument.rejectionReason && (
                            <p className="mt-1 text-sm text-danger">
                              Rejected: {attachedDocument.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="md"
                        disabled={pendingDocumentId === attachedDocument.id}
                        onClick={() => detach(attachedDocument.id, label)}
                      >
                        {pendingDocumentId === attachedDocument.id ? 'Detaching…' : 'Detach'}
                      </Button>
                    </div>
                  );
                }

                const unattachedUpload = documents.find(
                  (doc) =>
                    doc.type === type && (doc.status === 'uploaded' || doc.status === 'approved'),
                );

                if (unattachedUpload) {
                  return (
                    <div
                      key={type}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <p className="font-heading text-sm font-semibold text-text">{label}</p>
                        <p className="mt-1 text-sm text-text-muted">
                          {`${unattachedUpload.status === 'approved' ? 'Already approved' : 'Already on file'}: ${unattachedUpload.originalFilename}`}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        disabled={pendingDocumentId === unattachedUpload.id}
                        onClick={() => attach(unattachedUpload.id, label)}
                      >
                        {pendingDocumentId === unattachedUpload.id
                          ? 'Attaching…'
                          : 'Attach to this application'}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div key={type} className="p-4">
                    <DropzoneUploader
                      label={label}
                      variant="document"
                      onUpload={(file) => uploadAndAttach(type, file)}
                      uploading={uploadingType === type}
                      disabled={uploadingType !== null}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8">
            <Button
              type="button"
              size="lg"
              disabled={!application.readyToSubmit || submitting}
              onClick={handleSubmit}
              className="self-start"
            >
              {submitting ? 'Submitting…' : 'Submit application'}
            </Button>
            {!application.readyToSubmit && (
              <p className="text-sm text-text-muted">
                Every required document needs to be attached and approved before you can submit.
              </p>
            )}
            {submitError && (
              <p role="alert" className="text-sm text-danger">
                {submitError}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
