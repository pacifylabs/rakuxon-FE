'use client';

import { CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { Button } from '@rakuxon/ui';
import type { DocumentType, StudentDocument } from '@rakuxon/contract';

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export interface DocumentRowProps {
  type: DocumentType;
  label: string;
  document: StudentDocument | undefined;
  onUploaded: (document: StudentDocument) => void;
  onDeleted: (id: string) => void;
}

/**
 * One document slot: upload, replace or remove a single type. No "why this
 * matters" copy here — the page groups rows under a category that explains
 * that once, so six rows don't repeat six near-identical sentences.
 */
export function DocumentRow({ type, label, document, onUploaded, onDeleted }: DocumentRowProps) {
  const client = useApiClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const signature = await client.getUploadSignature({ type, filename: file.name });

      const form = new FormData();
      form.set('file', file);
      form.set('api_key', signature.apiKey);
      form.set('timestamp', String(signature.timestamp));
      form.set('signature', signature.signature);
      form.set('public_id', signature.publicId);

      /* Straight to Cloudinary, not through the API — a different origin
         entirely, so this is a plain fetch rather than an ApiClient method. */
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
      onUploaded(confirmed);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Could not upload that file. Please try again.',
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!document) return;
    setDeleting(true);
    setError(null);
    try {
      await client.deleteDocument(document.id);
      onDeleted(document.id);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not delete that file. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  }

  const uploaded = document?.status === 'uploaded';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
            uploaded ? 'bg-primary/15 text-primary' : 'bg-surface-muted text-text-muted'
          }`}
        >
          {uploaded ? (
            <CheckCircle2 aria-hidden="true" className="size-4" />
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
          {error && (
            <p role="alert" className="mt-1 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        {uploaded ? (
          <>
            <Button
              variant="ghost"
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Remove ${label}`}
              className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-danger disabled:opacity-50"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : (
          <Button
            variant="accent"
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload aria-hidden="true" className="mr-2 inline size-4" />
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        )}
      </div>
    </div>
  );
}
