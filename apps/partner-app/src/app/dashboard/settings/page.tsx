'use client';

import { useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, useToast } from '@rakuxon/ui';

function ProfileForm() {
  const { user, apiClient } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiClient.updateMyAccount({ firstName, lastName });
      window.dispatchEvent(new Event('rakuxon:profile-updated'));
      toast.success('Profile updated.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save these changes. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-text-muted">Email address</p>
        <p className="mt-1 text-base text-text">{user?.email}</p>
        <p className="mt-1 text-sm text-text-muted">Not editable here.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="First name"
          name="firstName"
          defaultValue={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />
        <FormField
          label="Last name"
          name="lastName"
          defaultValue={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" size="lg" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const { apiClient } = useAuth();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSaving(true);
    setError(null);
    try {
      await apiClient.changeMyPassword({
        currentPassword: String(data.get('currentPassword') ?? ''),
        newPassword: String(data.get('newPassword') ?? ''),
      });
      form.reset();
      toast.success('Password changed.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not change your password. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <FormField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Changing…' : 'Change password'}
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="font-heading text-3xl font-bold text-text">
        Account settings
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">Your profile and password.</p>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">Profile</h2>
        <ProfileForm />
      </div>

      <div className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-text">Password</h2>
        <ChangePasswordForm />
      </div>
    </section>
  );
}
