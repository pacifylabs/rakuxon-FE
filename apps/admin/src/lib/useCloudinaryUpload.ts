import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import type { AdminUploadSignatureRequest } from '@rakuxon/contract';

import { useAdminApiClient } from './admin-auth';

/**
 * Signs and performs a direct-to-Cloudinary upload for an admin-authored
 * content image (a testimonial photo, an institution's logo/hero, an
 * article's hero) — the same signed-upload shape `DocumentRow` uses on the
 * student side, minus the confirm step: there's no `Document` row to
 * reconcile here, just a URL to drop into whichever field asked for it.
 */
export function useCloudinaryUpload(folder: AdminUploadSignatureRequest['folder']) {
  const client = useAdminApiClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    setError(null);
    try {
      const signature = await client.getContentUploadSignature({ folder });

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
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadBody.secure_url) {
        throw new Error(uploadBody.error?.message ?? 'The upload did not complete.');
      }

      return uploadBody.secure_url;
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Could not upload that image. Please try again.',
      );
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}
