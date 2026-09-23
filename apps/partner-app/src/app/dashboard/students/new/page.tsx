'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, useToast } from '@rakuxon/ui';

/**
 * For a student the agency already has, manually or through another
 * system. Sets a real password directly — unlike an invite link, there's no
 * round trip. The account starts unverified: an agency is a lower trust
 * tier than a platform admin, so the student still confirms their own
 * email (they're sent the same verification email self-registration is).
 */
export default function NewStudentPage() {
  const router = useRouter();
  const { apiClient } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    try {
      const created = await apiClient.createAgencyStudent({
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      });
      toast.success('Student created.');
      router.push(`/dashboard/students/${created.id}`);
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not create the student. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="new-student-heading" className="max-w-xl">
      <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/students')}>
        ← Back to students
      </Button>

      <h1 id="new-student-heading" className="mt-4 font-heading text-3xl font-bold text-text">
        New student
      </h1>
      <p className="mt-2 text-base text-text-muted">
        For a student you already have, manually or through another system. They'll need to verify
        this email address before it's fully active.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="First name" name="firstName" autoComplete="given-name" required />
          <FormField label="Last name" name="lastName" autoComplete="family-name" required />
        </div>
        <FormField label="Email address" name="email" type="email" autoComplete="email" required />
        <FormField
          label="Temporary password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="They can change it via the reset flow afterwards."
          required
        />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div>
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending ? 'Creating…' : 'Create student'}
          </Button>
        </div>
      </form>
    </section>
  );
}
