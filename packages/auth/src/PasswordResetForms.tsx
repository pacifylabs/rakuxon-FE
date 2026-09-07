'use client';

import { useState } from 'react';

import { ApiClient, ApiError, NetworkError } from '@rakuxon/api-client';
import { AuthCard, Button, FormField } from '@rakuxon/ui';

const PASSWORD_MIN = 12;

/**
 * Step one: ask for a link.
 *
 * The confirmation is identical whether or not the address has an account,
 * mirroring what the API does. Saying "no such account" here would undo the
 * server's care not to leak which addresses are registered.
 */
export function RequestPasswordResetForm({
  baseUrl,
  signInHref = '/login',
}: {
  baseUrl: string;
  signInHref?: string;
}) {
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Enter a valid email address.');
      return;
    }

    setFieldError(undefined);
    setFormError(null);
    setPending(true);

    try {
      await new ApiClient({ baseUrl }).requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If that address has an account, a reset link is on its way. The link expires in an hour."
        footer={
          <a href={signInHref} className="rounded-sm font-semibold text-primary underline">
            Back to sign in
          </a>
        }
      >
        <p role="status" className="text-base text-text-muted">
          Nothing arrived? Check your spam folder, then try again — requesting a second link is
          safe.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We will email you a link to set a new one."
      footer={
        <a href={signInHref} className="rounded-sm font-semibold text-primary underline">
          Back to sign in
        </a>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldError}
        />

        {formError && (
          <p role="alert" className="rounded-md border border-danger px-4 py-3 text-sm text-text">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Sending…' : 'Email me a link'}
        </Button>
      </form>
    </AuthCard>
  );
}

/**
 * Step two: set the new password.
 *
 * On success every session is gone — the API revokes them — so the only place
 * to go is sign-in. Saying so up front avoids the user wondering why another
 * tab logged itself out.
 */
export function ConfirmPasswordResetForm({
  baseUrl,
  token,
  onComplete,
}: {
  baseUrl: string;
  token: string;
  onComplete: () => void;
}) {
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') ?? '');

    if (password.length < PASSWORD_MIN) {
      setFieldError(`Use at least ${PASSWORD_MIN} characters.`);
      return;
    }

    setFieldError(undefined);
    setFormError(null);
    setPending(true);

    try {
      await new ApiClient({ baseUrl }).confirmPasswordReset(token, password);
      onComplete();
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        /* The API deliberately does not distinguish expired from used from
           unknown, so neither can this. */
        setFormError('That link has expired or has already been used. Request a new one.');
      } else if (error instanceof ApiError || error instanceof NetworkError) {
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Setting it signs you out everywhere else."
      footer={null}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={fieldError}
          hint={`At least ${PASSWORD_MIN} characters.`}
        />

        {formError && (
          <p role="alert" className="rounded-md border border-danger px-4 py-3 text-sm text-text">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </AuthCard>
  );
}
