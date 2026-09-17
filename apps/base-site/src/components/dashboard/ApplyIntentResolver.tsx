'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';

import { courseRoute, universityRoute } from '@/content/routes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/**
 * A signed-in visitor who clicked "Proceed to apply" while browsing arrives
 * here carrying `?course=<slug>` or `?university=<slug>` — the same params
 * an anonymous visitor's registration carries through. This is the other
 * half of that handoff: turn the intent into a real application (course) or
 * a place to pick one (university), instead of leaving the query string
 * sitting there unread.
 *
 * A plain `<a href>` built the link, so there is no course id in hand yet —
 * only the slug the URL carries. The public catalogue lookup below resolves
 * it; a course that only exists in the local sample bank (never published to
 * the real catalogue) has no id to create an application against, so that
 * case falls back to the course's own page rather than failing silently.
 */
function ApplyIntentResolverInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApiClient();
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  const course = searchParams.get('course');
  const university = searchParams.get('university');

  useEffect(() => {
    if (!course && !university) return;
    if (started.current) return;
    started.current = true;
    setPending(true);

    void (async () => {
      try {
        if (course) {
          const response = await fetch(
            `${API_BASE_URL}/v1/catalogue/courses/${encodeURIComponent(course)}`,
          );
          if (!response.ok) {
            router.replace(courseRoute(course));
            return;
          }
          const found = (await response.json()) as { id: string };
          const application = await client.createApplication({ courseId: found.id });
          router.replace(`/dashboard/applications/${application.id}`);
          return;
        }

        if (university) {
          router.replace(`${universityRoute(university)}#courses`);
        }
      } catch (error) {
        /* Best effort: land them somewhere useful rather than stuck on a
           blank overlay. Applying can always be retried from the course or
           university page itself. */
        const message =
          error instanceof ApiError || error instanceof NetworkError
            ? error.message
            : 'Something went wrong starting your application.';
        console.error('[dashboard] apply-intent resolution failed:', message);
        if (course) router.replace(courseRoute(course));
        else setPending(false);
      }
    })();
  }, [course, university, client, router]);

  if (!pending) return null;

  return (
    <div
      role="status"
      className="fixed inset-0 z-50 grid place-items-center bg-bg/90 text-center"
    >
      <p className="text-base font-semibold text-text">Setting up your application…</p>
    </div>
  );
}

/** useSearchParams needs a Suspense boundary of its own, kept local so the
    dashboard page does not have to restructure around it. */
export function ApplyIntentResolver() {
  return (
    <Suspense fallback={null}>
      <ApplyIntentResolverInner />
    </Suspense>
  );
}
