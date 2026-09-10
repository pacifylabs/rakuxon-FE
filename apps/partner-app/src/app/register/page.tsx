'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useAuth } from '@rakuxon/auth';
import { AuthCard, Button, FormField } from '@rakuxon/ui';

/** Mirrors the API's rule, so the same input is rejected in the same terms. */
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const PASSWORD_MIN = 8;

type FieldErrors = Partial<
  Record<'agencyName' | 'slug' | 'email' | 'firstName' | 'lastName' | 'password', string>
>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerAgency } = useAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const values = {
      agencyName: String(data.get('agencyName') ?? '').trim(),
      slug: String(data.get('slug') ?? '')
        .trim()
        .toLowerCase(),
      email: String(data.get('email') ?? '').trim(),
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      password: String(data.get('password') ?? ''),
    };

    const errors: FieldErrors = {};
    if (!values.agencyName) errors.agencyName = 'Enter your agency name.';
    if (!SLUG_PATTERN.test(values.slug))
      errors.slug = 'Use 3–40 lowercase letters, digits or hyphens.';
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
      await registerAgency(values);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof ApiError && error.isConflict) {
        /* The API knows the subdomain is taken; show it on the field that
           caused it rather than as a detached banner. */
        setFieldErrors({ slug: error.message });
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
      title="Register your agency"
      subtitle="Create your workspace and your administrator account."
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
        <FormField
          label="Agency name"
          name="agencyName"
          placeholder="Northwind Education"
          error={fieldErrors.agencyName}
        />
        <FormField
          label="Subdomain"
          name="slug"
          placeholder="northwind"
          error={fieldErrors.slug}
          hint="Your workspace address, for example northwind.rakuxon.com"
        />
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
          placeholder="ada@northwind.example"
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
          {pending ? 'Creating your workspace…' : 'Create workspace'}
        </Button>
      </form>
    </AuthCard>
  );
}
