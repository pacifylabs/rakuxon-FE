'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useAuth } from '@rakuxon/auth';
import { Button } from '@rakuxon/ui';

import { AuthCard } from '@/components/AuthCard';
import { FormField } from '@/components/FormField';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    /* Validate before the request: a round trip to learn a field is empty is
       slower and tells the server about credentials it did not need. */
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
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) setFormError(error.message);
      else if (error instanceof NetworkError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your student pipeline, documents and applications."
      footer={
        <>
          No account yet?{' '}
          <a href="/register" className="rounded-sm font-semibold text-primary underline">
            Register your agency
          </a>
        </>
      }
    >
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
          /* Announced, because the failure is remote and off-screen from the
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
