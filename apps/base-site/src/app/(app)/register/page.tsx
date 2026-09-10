'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useAuth } from '@rakuxon/auth';
import { AuthCard, Button, FormField } from '@rakuxon/ui';

const PASSWORD_MIN = 8;

type FieldErrors = Partial<Record<'email' | 'firstName' | 'lastName' | 'password', string>>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerStudent } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const values = {
      email: String(data.get('email') ?? '').trim(),
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    };

    const errors: FieldErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      errors.email = 'Enter a valid email address.';
    if (!values.firstName) errors.firstName = 'Enter your first name.';
    if (!values.lastName) errors.lastName = 'Enter your last name.';
    if (values.password.length < PASSWORD_MIN)
      errors.password = `Use at least ${PASSWORD_MIN} characters.`;

    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    try {
      await registerStudent(values);

      /* Carries the course/university the visitor was looking at through to
         the dashboard, so applying does not ask them to find it a second time. */
      const params = new URLSearchParams();
      const course = searchParams.get('course');
      const university = searchParams.get('university');
      if (course) params.set('course', course);
      if (university) params.set('university', university);
      const query = params.toString();
      router.push(query ? `/dashboard?${query}` : '/dashboard');
    } catch (error) {
      if (error instanceof ApiError && error.isConflict) {
        setFieldErrors({ email: error.message });
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
      title="Create your account"
      subtitle="Search, shortlist and apply — all from one dashboard."
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
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ada@example.com"
          error={fieldErrors.email}
        />
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

/* useSearchParams needs a Suspense boundary, or the page opts out of static
   rendering with a build warning instead of a deliberate choice. */
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
