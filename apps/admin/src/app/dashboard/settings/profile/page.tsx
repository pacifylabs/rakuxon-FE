'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type { AdminAccount } from '@rakuxon/contract';

import { useAdminApiClient } from '@/lib/admin-auth';

export default function AdminProfilePage() {
  const client = useAdminApiClient();

  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await client.getAccount();
      setAccount(result);
      setFirstName(result.firstName);
      setLastName(result.lastName);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load your profile. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      setAccount(await client.updateAccountProfile({ firstName, lastName }));
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save these changes. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (error && !account) {
    return (
      <p role="alert" className="text-base text-danger">
        {error}
      </p>
    );
  }

  if (!account) {
    return (
      <p role="status" className="text-base text-text-muted">
        Loading…
      </p>
    );
  }

  return (
    <section aria-labelledby="profile-heading" className="max-w-xl">
      <h1 id="profile-heading" className="font-heading text-3xl font-bold text-text">
        Profile
      </h1>
      <p className="mt-2 text-base text-text-muted">Your name, as it appears across the admin.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <p className="text-sm text-text-muted">Email address</p>
          <p className="mt-1 text-base text-text">{account.email}</p>
          <p className="mt-1 text-sm text-text-muted">Not editable here.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="First name"
            name="firstName"
            defaultValue={account.firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
          <FormField
            label="Last name"
            name="lastName"
            defaultValue={account.lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="text-sm text-primary">
            Saved.
          </p>
        )}

        <div>
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  );
}
