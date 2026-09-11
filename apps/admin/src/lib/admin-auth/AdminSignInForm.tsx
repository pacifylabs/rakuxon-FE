'use client';

import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { AuthCard, Button, FormField } from '@rakuxon/ui';

import { useAdminAuth } from './AdminAuthProvider';

export interface AdminSignInFormProps {
  subtitle: string;
  onSignedIn: () => void;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

/**
 * The admin sign-in screen — same visual structure as `@rakuxon/auth`'s
 * `SignInForm`, wired to `AdminAuthProvider` instead. No self-registration
 * link: admin accounts are provisioned, never self-signed-up.
 */
export function AdminSignInForm({ subtitle, onSignedIn }: AdminSignInFormProps) {
  const { signIn } = useAdminAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    const errors: FieldErrors = {};
    if (!email) errors.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
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
    <AuthCard title="Sign in" subtitle={subtitle} footer={null}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ada@rakuxon.com"
          error={fieldErrors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={fieldErrors.password}
        />

        {formError && (
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
