'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiClient, ApiError, NetworkError } from '@rakuxon/api-client';
import { useAuth } from '@rakuxon/auth';
import { AuthCard, Button, FormField } from '@rakuxon/ui';
import type { PeekedLink } from '@rakuxon/contract';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const PASSWORD_MIN = 8;

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'password', string>>;

/** Not signed-in yet, so this reads the invitation directly rather than via useAuth(). */
function usePeekedLink(token: string) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'invalid' } | { status: 'ready'; link: PeekedLink }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const link = await new ApiClient({ baseUrl: API_BASE_URL }).peekOnboardingLink(token);
        if (!cancelled) setState({ status: 'ready', link });
      } catch {
        if (!cancelled) setState({ status: 'invalid' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return state;
}

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { registerViaOnboardingLink } = useAuth();

  const peeked = usePeekedLink(token);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const values = {
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    };

    const errors: FieldErrors = {};
    if (!values.firstName) errors.firstName = 'Enter your first name.';
    if (!values.lastName) errors.lastName = 'Enter your last name.';
    if (values.password.length < PASSWORD_MIN)
      errors.password = `Use at least ${PASSWORD_MIN} characters.`;

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await registerViaOnboardingLink({ token, ...values });
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) {
        setFormError(error.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  if (peeked.status === 'loading') {
    return (
      <AuthCard title="Checking your invitation" subtitle="One moment." footer={null} ownsMainLandmark={false}>
        <p role="status" className="text-base text-text-muted">
          Loading…
        </p>
      </AuthCard>
    );
  }

  if (peeked.status === 'invalid') {
    return (
      <AuthCard
        title="This invitation isn't valid"
        subtitle="It may have expired, already been used, or been withdrawn."
        ownsMainLandmark={false}
        footer={
          <>
            Ask whoever sent it for a new one, or{' '}
            <a href="/register" className="rounded-sm font-semibold text-primary underline">
              create an account directly
            </a>
            .
          </>
        }
      >
        <p role="alert" className="text-base text-text-muted">
          No account was created.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={`Join ${peeked.link.tenantName}`}
      subtitle={`Finish setting up your account as ${peeked.link.inviteeEmail}.`}
      ownsMainLandmark={false}
      footer={
        <>
          Already have an account?{' '}
          <a href="/login" className="rounded-sm font-semibold text-primary underline">
            Sign in
          </a>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Ada"
            error={fieldErrors.firstName}
          />
          <FormField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Lovelace"
            error={fieldErrors.lastName}
          />
        </div>
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${PASSWORD_MIN} characters`}
          error={fieldErrors.password}
          hint={`At least ${PASSWORD_MIN} characters.`}
        />

        {formError && (
          <p role="alert" className="rounded-md border border-danger px-4 py-3 text-sm text-text">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
}
