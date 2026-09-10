'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { ApiClient, ApiError } from '@rakuxon/api-client';
import { sessionFromTokens, writeSession } from '@rakuxon/auth';
import { AuthCard } from '@rakuxon/ui';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/**
 * Completes a provider redirect.
 *
 * The `state` parameter is compared against what was stored before leaving. A
 * mismatch means the code did not originate from a sign-in this browser
 * started, which is CSRF against the sign-in — refuse it rather than exchange.
 */
function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params?.get('code');
    const state = params?.get('state');

    let expected: string | null = null;
    try {
      expected = sessionStorage.getItem('rakuxon.sso.state');
      sessionStorage.removeItem('rakuxon.sso.state');
    } catch {
      expected = null;
    }

    if (!code) {
      setError('That sign-in was cancelled or did not complete.');
      return;
    }

    if (!state || !expected || state !== expected) {
      setError('That sign-in could not be verified. Please start again.');
      return;
    }

    void (async () => {
      try {
        const tokens = await new ApiClient({ baseUrl: API_BASE_URL }).ssoCallback(
          'google',
          code,
          `${window.location.origin}/sso/callback`,
        );
        writeSession(sessionFromTokens(tokens));
        router.replace('/dashboard');
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'Could not complete that sign-in. Please try again.',
        );
      }
    })();
  }, [params, router]);

  if (error) {
    return (
      <AuthCard
        title="Sign-in did not complete"
        subtitle={error}
        ownsMainLandmark={false}
        footer={
          <a href="/login" className="rounded-sm font-semibold text-primary underline">
            Back to sign in
          </a>
        }
      >
        <p role="alert" className="text-base text-text-muted">
          No changes were made to your account.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Signing you in"
      subtitle="One moment."
      footer={null}
      ownsMainLandmark={false}
    >
      <p role="status" className="text-base text-text-muted">
        Completing your sign-in…
      </p>
    </AuthCard>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
