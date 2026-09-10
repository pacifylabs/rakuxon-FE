'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { Button } from '@rakuxon/ui';
import type { Application } from '@rakuxon/contract';

import { ApplicationStatusBadge } from '@/components/dashboard/ApplicationStatusBadge';
import { RequiredDocumentsChecklist } from '@/components/dashboard/RequiredDocumentsChecklist';

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useApiClient();

  const [application, setApplication] = useState<Application | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setApplication(await client.getApplication(params.id));
    } catch (error) {
      setLoadError(
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Could not load this application. Please try again.',
      );
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      setApplication(await client.submitApplication(params.id));
    } catch (error) {
      setSubmitError(
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Could not submit this application. Please try again.',
      );
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

  if (!application) {
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
        <p className="mt-4 max-w-prose text-base text-text-muted">
          Submitted{' '}
          {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : ''}.
          Review and offer updates will appear here once available.
        </p>
      ) : (
        <>
          <p className="mt-4 max-w-prose text-base text-text-muted">
            Complete your profile and attach the required documents, then submit.
          </p>

          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-text">Required documents</h2>
            <div className="mt-4">
              <RequiredDocumentsChecklist missing={application.missingDocumentTypes} />
            </div>
            <a
              href="/dashboard/documents"
              className="mt-4 inline-block rounded-sm text-sm font-semibold text-primary underline"
            >
              Manage documents
            </a>
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
                Complete your profile and attach every required document before submitting.
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
