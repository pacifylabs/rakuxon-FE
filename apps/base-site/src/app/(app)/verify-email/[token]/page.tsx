'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiClient } from '@rakuxon/api-client';
import { AuthCard } from '@rakuxon/ui';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

/** No session is required — the token itself is the proof. */
function useConfirmVerification(token: string) {
  const [state, setState] = useState<'pending' | 'verified' | 'invalid'>('pending');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await new ApiClient({ baseUrl: API_BASE_URL }).confirmEmailVerification(token);
        if (!cancelled) setState('verified');
      } catch {
        if (!cancelled) setState('invalid');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return state;
}

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const state = useConfirmVerification(token);

  if (state === 'pending') {
    return (
      <AuthCard title="Confirming your email" subtitle="One moment." footer={null} ownsMainLandmark={false}>
        <p role="status" className="text-base text-text-muted">
          Loading…
        </p>
      </AuthCard>
    );
  }

  if (state === 'invalid') {
    return (
      <AuthCard
        title="This link isn't valid"
        subtitle="It may have expired, already been used, or been mistyped."
        ownsMainLandmark={false}
        footer={
          <a href="/dashboard" className="rounded-sm font-semibold text-primary underline">
            Go to your dashboard
          </a>
        }
      >
        <p role="alert" className="text-base text-text-muted">
          You can request a new link from your dashboard.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Email confirmed"
      subtitle="Your address is verified."
      ownsMainLandmark={false}
      footer={
        <a href="/dashboard" className="rounded-sm font-semibold text-primary underline">
          Go to your dashboard
        </a>
      }
    >
      <p role="status" className="text-base text-text-muted">
        You're all set. Nothing else to do here.
      </p>
    </AuthCard>
  );
}
