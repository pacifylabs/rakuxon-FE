'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { ApplicationStatusBadge, Button, StatusBadge } from '@rakuxon/ui';
import type { AdminApplicationDetail } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

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
 * Read-only, same as the applications list: review/decision workflow is a
 * later stage. This screen is the fuller picture behind one row — who it's
 * for, which course, and how close it is to submittable.
 */
function ApplicationDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();

  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <section>
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
        <Button variant="ghost" size="md" className="mt-4" onClick={() => router.push('/dashboard/applications')}>
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
          <Field label="Tenant" value={application.tenantName} />
        </dl>

        <dl className="grid gap-6">
          <Field label="Created" value={new Date(application.createdAt).toLocaleString()} />
          <Field label="Submitted" value={application.submittedAt ? new Date(application.submittedAt).toLocaleString() : ''} />
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
          {application.attachedDocumentIds.length} document{application.attachedDocumentIds.length === 1 ? '' : 's'} attached.
        </p>

        {application.missingDocumentTypes.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-text">Still missing</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {application.missingDocumentTypes.map((type) => (
                <li key={type}>
                  <StatusBadge tone="negative">{humanize(type)}</StatusBadge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ApplicationDetailPage() {
  return (
    <RequirePermission
      permissions={['applications.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view applications.</p>}
    >
      <ApplicationDetail />
    </RequirePermission>
  );
}
