'use client';

import { DropzoneUploader } from '@rakuxon/ui';
import type { AdminUploadSignatureRequest } from '@rakuxon/contract';

import { useCloudinaryUpload } from '@/lib/useCloudinaryUpload';

export interface ImageUploadFieldProps {
  label: string;
  folder: AdminUploadSignatureRequest['folder'];
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

/**
 * A real file upload (drag-and-drop or click-to-browse) in place of pasting a
 * URL — signs and sends the file straight to Cloudinary
 * (`useCloudinaryUpload`), then hands the resulting `secure_url` to
 * `onChange`, same as if it had been typed in.
 */
export function ImageUploadField({
  label,
  folder,
  value,
  onChange,
  disabled,
}: ImageUploadFieldProps) {
  const { upload, uploading, error } = useCloudinaryUpload(folder);

  async function handleUpload(file: File) {
    const url = await upload(file);
    if (url) onChange(url);
  }

  return (
    <DropzoneUploader
      label={label}
      accept="image/*"
      variant="image"
      value={value}
      onUpload={handleUpload}
      uploading={uploading}
      error={error}
      disabled={disabled}
    />
  );
}
