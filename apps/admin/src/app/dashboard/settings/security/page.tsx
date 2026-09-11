'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, StatusBadge } from '@rakuxon/ui';
import type { AdminAccount, TotpSetup } from '@rakuxon/contract';

import { useAdminApiClient } from '@/lib/admin-auth';

function ChangePasswordForm() {
  const client = useAdminApiClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await client.changeAccountPassword({
        currentPassword: String(data.get('currentPassword') ?? ''),
        newPassword: String(data.get('newPassword') ?? ''),
      });
      form.reset();
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not change your password. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
      <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" required />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="text-sm text-primary">
          Password changed.
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

function TotpSetupFlow({
  onJustEnabled,
  onDone,
}: {
  /** Fired the instant the code checks out — before the backup codes are dismissed, so the badge can update right away. */
  onJustEnabled: () => void;
  /** Fired once the admin has acknowledged the backup codes — safe to reload the account and swap this flow out. */
  onDone: () => void;
}) {
  const client = useAdminApiClient();
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function startSetup() {
    setError(null);
    setPending(true);
    try {
      setSetup(await client.setupTotp());
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not start 2FA setup. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  async function confirmCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setPending(true);
    try {
      const result = await client.enableTotp({ code: code.trim() });
      setBackupCodes(result.backupCodes);
      onJustEnabled();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That code was not accepted. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (backupCodes) {
    return (
      <div className="mt-6 max-w-md rounded-lg border border-border bg-surface p-5">
        <p className="font-heading text-sm font-semibold text-text">Two-factor authentication is on</p>
        <p className="mt-2 text-sm text-text-muted">
          Save these backup codes somewhere safe — each works once, in place of your authenticator app, if you
          lose access to it. They will not be shown again.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm text-text">
          {backupCodes.map((backupCode) => (
            <li key={backupCode} className="rounded-md bg-surface-muted px-3 py-2">
              {backupCode}
            </li>
          ))}
        </ul>
        <Button variant="primary" className="mt-5" onClick={onDone}>
          I've saved these
        </Button>
      </div>
    );
  }

  if (setup) {
    return (
      <form onSubmit={confirmCode} className="mt-6 flex max-w-md flex-col gap-4">
        <p className="text-sm text-text-muted">
          Scan this with your authenticator app (Google Authenticator, 1Password, Authy, and so on), then enter
          the 6-digit code it shows.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- a data: URI, not a remote image */}
        <img src={setup.qrCodeDataUrl} alt="2FA setup QR code" width={200} height={200} className="rounded-md border border-border" />
        <p className="text-sm text-text-muted">
          Can't scan it? Enter this key by hand: <span className="font-mono text-text">{setup.secret}</span>
        </p>

        <FormField
          label="Authentication code"
          name="code"
          type="text"
          autoComplete="one-time-code"
          placeholder="123456"
          onChange={(event) => setCode(event.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div>
          <Button type="submit" variant="primary" disabled={pending || !code.trim()}>
            {pending ? 'Confirming…' : 'Confirm and turn on'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-6">
      {error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Button variant="primary" onClick={startSetup} disabled={pending}>
        {pending ? 'Starting…' : 'Set up two-factor authentication'}
      </Button>
    </div>
  );
}

function DisableTotpForm({ onDisabled }: { onDisabled: () => void }) {
  const client = useAdminApiClient();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await client.disableTotp({ password });
      onDisabled();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not turn off 2FA. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <div className="mt-6">
        <Button variant="ghost" onClick={() => setConfirming(true)}>
          Turn off 2FA
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
      <FormField
        label="Confirm your password"
        name="password"
        type="password"
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={pending || !password}>
          {pending ? 'Turning off…' : 'Turn off 2FA'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminSecurityPage() {
  const client = useAdminApiClient();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* The badge reflects this the instant a code checks out — the account
     itself is only reloaded once the backup codes are dismissed, so the
     setup panel does not get swapped out from under someone still reading them. */
  const [totpJustEnabled, setTotpJustEnabled] = useState(false);
  const totpEnabled = account?.totpEnabled || totpJustEnabled;

  const load = useCallback(async () => {
    try {
      setAccount(await client.getAccount());
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load your security settings. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-labelledby="security-heading">
      <h1 id="security-heading" className="font-heading text-3xl font-bold text-text">
        Security
      </h1>
      <p className="mt-2 text-base text-text-muted">Your password and two-factor authentication.</p>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">Password</h2>
        <ChangePasswordForm />
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl font-semibold text-text">Two-factor authentication</h2>
          {account &&
            (totpEnabled ? (
              <StatusBadge tone="positive">On</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Off</StatusBadge>
            ))}
        </div>
        <p className="mt-2 max-w-prose text-base text-text-muted">
          Adds a second step at sign-in, using an authenticator app on your phone.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-base text-danger">
            {error}
          </p>
        )}

        {!account && !error && (
          <p role="status" className="mt-4 text-base text-text-muted">
            Loading…
          </p>
        )}

        {account &&
          (account.totpEnabled ? (
            <DisableTotpForm onDisabled={() => { setTotpJustEnabled(false); void load(); }} />
          ) : (
            <TotpSetupFlow onJustEnabled={() => setTotpJustEnabled(true)} onDone={load} />
          ))}
      </div>
    </section>
  );
}
