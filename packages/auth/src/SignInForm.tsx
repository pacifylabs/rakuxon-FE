'use client';

import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { AuthCard, Button, FormField } from '@rakuxon/ui';

import { useAuth } from './AuthProvider';

export interface SignInFormProps {
  /** What this surface is for, e.g. "Access your student pipeline". */
  subtitle: string;
  /** Where to go once signed in. */
  onSignedIn: () => void;
  /** Rendered under the card. Registration only makes sense for agencies. */
  footer?: React.ReactNode;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

/**
 * The sign-in screen, shared by every authenticated surface.
 *
 * One implementation rather than one per app: three copies of a login form
 * drift, and the one that drifts is usually the one nobody looks at. Apps
 * supply only the wording and where to go next.
 */
export function SignInForm({ subtitle, onSignedIn, footer }: SignInFormProps) {
  const { signIn } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    /* Validate first: a round trip to learn a field is empty is slower, and
       hands the server credentials it did not need. */
    const errors: FieldErrors = {};
    if (!email) errors.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await signIn({ email, password });
      onSignedIn();
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle={subtitle} footer={footer}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        {formError && (
          /* Announced: the failure is remote and off-screen from whatever
             control the user was last touching. */
          <p role="alert" className="rounded-md border border-danger px-4 py-3 text-sm text-text">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
