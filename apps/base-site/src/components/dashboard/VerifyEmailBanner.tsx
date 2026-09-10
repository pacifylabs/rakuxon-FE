'use client';

import { MailWarning } from 'lucide-react';
import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';

/**
 * Shown on every dashboard page until the address is confirmed — a link in
 * an inbox is easy to miss, so the reminder outlasts a single visit rather
 * than being dismissible.
 */
export function VerifyEmailBanner({ email }: { email: string }) {
  const client = useApiClient();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleResend() {
    setState('sending');
    try {
      await client.resendEmailVerification();
      setState('sent');
    } catch (error) {
      setState('error');
      console.error('[dashboard] resend verification failed:', error instanceof ApiError || error instanceof NetworkError ? error.message : error);
    }
  }

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-accent-soft px-5 py-4"
    >
      <MailWarning aria-hidden="true" className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-text">
        {state === 'sent' ? (
          <>Verification link resent to <strong>{email}</strong>.</>
        ) : (
          <>
            Please verify <strong>{email}</strong> — check your inbox for the link.
          </>
        )}
      </p>
      {state !== 'sent' && (
        <button
          type="button"
          onClick={handleResend}
          disabled={state === 'sending'}
          className="rounded-sm text-sm font-semibold text-primary underline disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : state === 'error' ? 'Try again' : 'Resend link'}
        </button>
      )}
    </div>
  );
}
