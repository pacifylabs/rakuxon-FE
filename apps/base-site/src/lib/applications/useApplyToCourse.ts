'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import type { ApiCourse } from '@/lib/catalogue/api';

/**
 * Creates an application for a course the caller already has in hand — no
 * `/register` round trip, since a dashboard visitor calling this is already
 * signed in. Extracted from `ApplyIntentResolver`, which still handles the
 * separate case of a visitor arriving from a public page.
 */
export function useApplyToCourse() {
  const client = useApiClient();
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(course: ApiCourse) {
    setApplying(true);
    setError(null);
    try {
      const application = await client.createApplication({ courseId: course.id });
      router.push(`/dashboard/applications/${application.id}`);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not start your application. Please try again.',
      );
      setApplying(false);
    }
  }

  return { apply, applying, error };
}
