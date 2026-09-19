'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { ApplicationStatusBadge, Button, ConfirmDialog, StatusBadge, useToast } from '@rakuxon/ui';
import type { AdminApplicationDetail, AssignableAdmin, StudentDocument } from '@rakuxon/contract';

import { AdminDocumentRow } from '@/components/dashboard/AdminDocumentRow';
import { DOCUMENT_TYPE_LABELS } from '@/components/dashboard/documentTypes';
import { HistoryPanel } from '@/components/dashboard/HistoryPanel';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-1 text-base text-text">{value || '—'}</dd>
    </div>
  );
}

/** "academic_certificate" -> "Academic certificate" — no shared label table to import across apps. */
function humanize(type: string): string {
  const words = type.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Review/decision workflow is still a later stage — this screen is the
 * fuller picture behind one row: who it's for, which course, how close it
 * is to submittable, and — since an admin can act on a student's behalf —
 * the actual controls to get it there: attach a document the student
 * already has on file, or upload a new one directly, either of which
 * updates `missingDocumentTypes` immediately.
 */
function ApplicationDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission('applications.manage');
  const canReview = hasPermission('documents.review');

  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AssignableAdmin[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [confirmingAssign, setConfirmingAssign] = useState<{
    adminId: string | null;
    label: string;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      setApplication(await client.getAdminApplication(params.id));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this application. Please try again.',
      );
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!canManage) return;
    client
      .listAssignableAdmins()
      .then((result) => setAdmins(result.items))
      .catch(() => {
        /* The assign selector degrades to "no admins listed" — the rest of the page still works. */
      });
  }, [client, canManage]);

  async function confirmAssign() {
    if (!application || confirmingAssign === undefined || confirmingAssign === null) return;
    setAssigning(true);
    try {
      setApplication(
        await client.assignApplication(application.id, { adminId: confirmingAssign.adminId }),
      );
      toast.success(
        confirmingAssign.adminId ? `Assigned to ${confirmingAssign.label}.` : 'Unassigned.',
      );
      setConfirmingAssign(null);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not update the assignment. Please try again.',
      );
    } finally {
      setAssigning(false);
    }
  }

  const loadDocuments = useCallback(async () => {
    if (!application || !canReview) return;
    try {
      setDocuments(await client.listAdminStudentDocuments(application.studentId));
      setDocumentsError(null);
    } catch (caught) {
      setDocumentsError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this student’s documents. Please try again.',
      );
    }
  }, [client, application, canReview]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function attach(documentId: string) {
    if (!application) return;
    setPendingDocumentId(documentId);
    try {
      setApplication(await client.attachApplicationDocument(application.id, documentId));
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
      setApplication(await client.detachApplicationDocument(application.id, documentId));
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

  /**
   * Fires after an upload or a reject from a row below. A freshly uploaded
   * document for a type this application is still missing is attached
   * immediately — the whole reason this section exists is so uploading a
   * document here is enough on its own, with no separate "now go attach
   * it" step.
   */
  async function handleDocumentChanged(updated: StudentDocument) {
    setDocuments((current) => {
      const withoutPrevious = (current ?? []).filter((entry) => entry.id !== updated.id);
      return [updated, ...withoutPrevious];
    });

    if (updated.status === 'uploaded' && application?.missingDocumentTypes.includes(updated.type)) {
      await attach(updated.id);
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

  /** The already-uploaded (or already-approved) document of a given type, not yet attached here. */
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
          <Field label="Partner" value={application.tenantName} />
        </dl>

        <dl className="grid gap-6">
          <div>
            <dt className="text-sm text-text-muted">Assigned to</dt>
            {canManage ? (
              <dd className="mt-1">
                <select
                  value={application.assignedAdminId ?? ''}
                  disabled={assigning}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      setConfirmingAssign({ adminId: null, label: '' });
                      return;
                    }
                    const chosen = admins.find((admin) => admin.id === value);
                    setConfirmingAssign({
                      adminId: value,
                      label: chosen ? `${chosen.firstName} ${chosen.lastName}` : 'this admin',
                    });
                  }}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-base text-text focus-visible:outline-none focus-visible:ring"
                >
                  <option value="">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.firstName} {admin.lastName}
                    </option>
                  ))}
                </select>
              </dd>
            ) : (
              <dd className="mt-1 text-base text-text">{application.assignedAdminName ?? '—'}</dd>
            )}
          </div>
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

        {application.missingDocumentTypes.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-text">Still missing</p>
            <p className="mt-1 text-sm text-text-muted">
              Not yet approved — including anything attached below that's still pending review.
            </p>

            {!canManage ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {application.missingDocumentTypes.map((type) => (
                  <li key={type}>
                    <StatusBadge tone="negative">{humanize(type)}</StatusBadge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
                {application.missingDocumentTypes
                  .filter(
                    (type) =>
                      !documents?.some(
                        (doc) =>
                          doc.type === type && application.attachedDocumentIds.includes(doc.id),
                      ),
                  )
                  .map((type) => {
                    const existing = unattachedUploadOf(type);

                    if (existing) {
                      return (
                        <div
                          key={type}
                          className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                          <div>
                            <p className="font-heading text-sm font-semibold text-text">
                              {DOCUMENT_TYPE_LABELS[type] ?? humanize(type)}
                            </p>
                            <p className="mt-1 text-sm text-text-muted">
                              Already on file: {existing.originalFilename}
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="md"
                            disabled={pendingDocumentId === existing.id}
                            onClick={() => attach(existing.id)}
                          >
                            {pendingDocumentId === existing.id
                              ? 'Attaching…'
                              : 'Attach to this application'}
                          </Button>
                        </div>
                      );
                    }

                    return canReview ? (
                      <AdminDocumentRow
                        key={type}
                        studentId={application.studentId}
                        type={type}
                        label={DOCUMENT_TYPE_LABELS[type] ?? humanize(type)}
                        document={undefined}
                        canReview={canReview}
                        onChanged={handleDocumentChanged}
                      />
                    ) : (
                      <div key={type} className="p-4 text-sm text-text-muted">
                        {DOCUMENT_TYPE_LABELS[type] ?? humanize(type)} — not uploaded.
                      </div>
                    );
                  })}
                {documentsError && (
                  <p role="alert" className="p-4 text-sm text-danger">
                    {documentsError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {canManage && application.attachedDocumentIds.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text">Attached</p>
            <ul className="mt-2 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
              {application.attachedDocumentIds.map((documentId) => {
                const entry = documents?.find((doc) => doc.id === documentId);

                if (entry && canReview) {
                  return (
                    <li key={documentId} className="flex flex-wrap items-start justify-between">
                      <div className="flex-1">
                        <AdminDocumentRow
                          studentId={application.studentId}
                          type={entry.type}
                          label={DOCUMENT_TYPE_LABELS[entry.type] ?? humanize(entry.type)}
                          document={entry}
                          canReview={canReview}
                          onChanged={handleDocumentChanged}
                        />
                      </div>
                      <div className="p-4">
                        <Button
                          variant="ghost"
                          size="md"
                          disabled={pendingDocumentId === documentId}
                          onClick={() => detach(documentId)}
                        >
                          {pendingDocumentId === documentId ? 'Detaching…' : 'Detach'}
                        </Button>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={documentId}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <p className="text-sm text-text">
                      {entry
                        ? (DOCUMENT_TYPE_LABELS[entry.type] ?? humanize(entry.type))
                        : documentId}
                      {entry ? ` — ${entry.originalFilename}` : ''}
                    </p>
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

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">History</h2>
        <div className="mt-4">
          <HistoryPanel load={() => client.getApplicationAuditLog(application.id)} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmingAssign !== null}
        onOpenChange={(open) => !open && setConfirmingAssign(null)}
        title={
          confirmingAssign?.adminId
            ? `Assign to ${confirmingAssign.label}?`
            : 'Unassign this application?'
        }
        confirmLabel={confirmingAssign?.adminId ? 'Assign' : 'Unassign'}
        confirming={assigning}
        onConfirm={confirmAssign}
      />
    </section>
  );
}

export default function ApplicationDetailPage() {
  return (
    <RequirePermission
      permissions={['applications.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view applications.
        </p>
      }
    >
      <ApplicationDetail />
    </RequirePermission>
  );
}
