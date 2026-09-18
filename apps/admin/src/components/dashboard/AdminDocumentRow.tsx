'use client';

import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, ConfirmDialog, DropzoneUploader, useToast } from '@rakuxon/ui';
import type { DocumentType, StudentDocument } from '@rakuxon/contract';

import { useAdminApiClient } from '@/lib/admin-auth';

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export interface AdminDocumentRowProps {
  studentId: string;
  type: DocumentType;
  label: string;
  /** The most recent document of this type, if the student has one at all. */
  document: StudentDocument | undefined;
  /** Only an admin holding `documents.review` sees the action controls — everyone else sees status only. */
  canReview: boolean;
  onChanged: (document: StudentDocument) => void;
}

/**
 * Mirrors `apps/base-site`'s own `DocumentRow` — same signature → direct
 * Cloudinary POST → confirm sequence — with `studentId` passed explicitly
 * instead of read from the signed-in user, since the admin isn't the
 * document's owner. Adds the one thing the student's own row has no reason
 * to offer: rejecting an upload.
 */
export function AdminDocumentRow({
  studentId,
  type,
  label,
  document,
  canReview,
  onChanged,
}: AdminDocumentRowProps) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const signature = await client.getAdminUploadSignature(studentId, {
        type,
        filename: file.name,
      });

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

      const confirmed = await client.confirmAdminDocumentUpload(signature.documentId, {
        secureUrl: uploadBody.secure_url,
        bytes: uploadBody.bytes ?? file.size,
        mimeType: file.type || 'application/octet-stream',
      });
      onChanged(confirmed);
      toast.success(`${label} uploaded.`);
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Could not upload that file. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleReject() {
    if (!document || !reason.trim()) return;
    setSubmittingReject(true);
    setError(null);
    try {
      const rejected = await client.rejectDocument(document.id, { reason: reason.trim() });
      onChanged(rejected);
      setRejecting(false);
      setReason('');
      toast.success(`${label} rejected.`);
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not reject that document. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmittingReject(false);
    }
  }

  const uploaded = document?.status === 'uploaded';
  const rejected = document?.status === 'rejected';

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
              uploaded
                ? 'bg-primary/15 text-primary'
                : rejected
                  ? 'bg-danger/15 text-danger'
                  : 'bg-surface-muted text-text-muted'
            }`}
          >
            {uploaded ? (
              <CheckCircle2 aria-hidden="true" className="size-4" />
            ) : rejected ? (
              <XCircle aria-hidden="true" className="size-4" />
            ) : (
              <FileText aria-hidden="true" className="size-4" />
            )}
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-text">{label}</p>
            {uploaded && document && (
              <p className="mt-1 text-sm text-text-muted">
                {document.originalFilename}
                {document.bytes ? ` · ${formatBytes(document.bytes)}` : ''}
              </p>
            )}
            {rejected && document?.rejectionReason && (
              <p className="mt-1 text-sm text-danger">Rejected: {document.rejectionReason}</p>
            )}
            {!document && <p className="mt-1 text-sm text-text-muted">Not uploaded</p>}
            {error && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        </div>

        {canReview && (
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            <DropzoneUploader
              label={uploaded ? 'Replace' : 'Upload on behalf'}
              layout="inline"
              variant="document"
              onUpload={handleFile}
              uploading={uploading}
              disabled={uploading}
            />
            {uploaded && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setRejecting(true)}
              >
                Reject
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={rejecting}
        onOpenChange={(open) => {
          setRejecting(open);
          if (!open) setReason('');
        }}
        title={`Reject ${label}?`}
        description="The student will see this reason and can upload a replacement."
        confirmLabel="Confirm reject"
        tone="danger"
        confirming={submittingReject}
        confirmDisabled={!reason.trim()}
        onConfirm={handleReject}
      >
        <label className="text-sm font-medium text-text" htmlFor={`reject-reason-${type}`}>
          Reason
        </label>
        <textarea
          id={`reject-reason-${type}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={2}
          placeholder="The scan is illegible — please re-upload a clearer copy."
          className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
        />
      </ConfirmDialog>
    </div>
  );
}
