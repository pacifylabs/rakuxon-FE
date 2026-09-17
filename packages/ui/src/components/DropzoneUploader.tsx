'use client';

import clsx from 'clsx';
import { FileText, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { DragEvent } from 'react';

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export interface DropzoneUploaderProps {
  /**
   * `layout="field"`: the caption shown above the dropzone box.
   * `layout="inline"`: the trigger's own visible text (e.g. "Replace").
   */
  label: string;
  accept?: string;
  /** Current image URL, for `variant="image"` preview. */
  value?: string | null;
  /** Current file info, for `variant="document"` preview. */
  fileMeta?: { name: string; bytes?: number | null } | null;
  /** Caller owns the signature/upload/confirm sequence — this just hands over the file. */
  onUpload: (file: File) => Promise<void> | void;
  uploading: boolean;
  error?: string | null;
  disabled?: boolean;
  variant?: 'image' | 'document';
  /**
   * `field` (default): a full dropzone box with its own preview — for a
   * standalone image/file field.
   * `inline`: a compact drag-capable trigger button with no preview of its
   * own — for a row that already renders the current file elsewhere (e.g.
   * the status text next to it in `DocumentRow`).
   */
  layout?: 'field' | 'inline';
}

/**
 * One reusable drag-and-drop (plus click-to-browse) upload control, used for
 * every upload in the app — admin content images and student/admin document
 * uploads alike. Cloudinary/API-agnostic on purpose: callers keep owning
 * their own signature → upload → (optional) confirm sequence via `onUpload`,
 * this only owns the drag/drop/click interaction and preview.
 */
export function DropzoneUploader({
  label,
  accept,
  value,
  fileMeta,
  onUpload,
  uploading,
  error,
  disabled,
  variant = 'image',
  layout = 'field',
}: DropzoneUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepth = useRef(0);

  function openBrowser() {
    if (!disabled && !uploading) inputRef.current?.click();
  }

  function handleFile(file: File) {
    void onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (disabled || uploading) return;
    dragDepth.current += 1;
    setIsDragActive(true);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragActive(false);
    if (disabled || uploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const hasContent = variant === 'image' ? Boolean(value) : Boolean(fileMeta);

  const dropzone = (
    <button
      type="button"
      disabled={disabled || uploading}
      onClick={openBrowser}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 text-center transition-colors duration-fast ease-standard',
        'focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        layout === 'field'
          ? 'aspect-[16/6] flex-col gap-2 p-4'
          : 'gap-2 rounded-md px-4 py-2 text-sm font-semibold',
        isDragActive
          ? 'border-primary bg-accent-soft'
          : hasContent
            ? 'border-border bg-surface'
            : 'border-dashed border-border bg-surface-muted hover:border-primary',
        !disabled && !uploading && 'cursor-pointer',
      )}
    >
      {layout === 'field' && variant === 'image' && value ? (
        <>
          <Image src={value} alt="" fill unoptimized className="object-contain p-2" />
          {!disabled && (
            <span className="absolute inset-x-0 bottom-0 bg-scrim py-1.5 text-xs font-medium text-on-primary opacity-0 transition-opacity duration-fast ease-standard hover:opacity-90">
              {uploading ? 'Uploading…' : 'Drag and drop, or click to replace'}
            </span>
          )}
        </>
      ) : layout === 'field' && variant === 'document' && fileMeta ? (
        <div className="flex items-center gap-2 text-sm text-text">
          <FileText aria-hidden="true" className="size-5 shrink-0 text-text-muted" />
          <span className="truncate">{fileMeta.name}</span>
          {fileMeta.bytes ? (
            <span className="shrink-0 text-text-muted">· {formatBytes(fileMeta.bytes)}</span>
          ) : null}
        </div>
      ) : layout === 'field' ? (
        <>
          <Upload aria-hidden="true" className="size-6 text-text-muted" />
          <span className="text-sm text-text-muted">
            {uploading ? 'Uploading…' : 'Drag and drop, or click to browse'}
          </span>
        </>
      ) : (
        <>
          <Upload aria-hidden="true" className="size-4" />
          {uploading ? 'Uploading…' : label}
        </>
      )}

      {isDragActive && layout === 'field' && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-primary opacity-10" />
      )}
    </button>
  );

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) handleFile(file);
      }}
    />
  );

  if (layout === 'inline') {
    return (
      <>
        {dropzone}
        {input}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">{label}</span>
      {dropzone}
      {input}
      {hasContent && !disabled && (
        <span className="text-xs text-text-muted">Drag a new file onto it, or click to replace.</span>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
