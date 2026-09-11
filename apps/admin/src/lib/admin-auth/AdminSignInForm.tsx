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
 *
 * A second step appears in place of the form when the account has 2FA on —
 * `signIn` resolves to a challenge rather than completing, so nothing here
 * ever holds a real session before the code checks out.
 */
export function AdminSignInForm({ subtitle, onSignedIn }: AdminSignInFormProps) {
  const { signIn, verifyTotp } = useAdminAuth();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [code, setCode] = useState('');

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
      const challenge = await signIn({ email, password });
      if (challenge) {
        setChallengeToken(challenge.challengeToken);
      } else {
        onSignedIn();
      }
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeToken || !code.trim()) return;

    setFormError(null);
    setPending(true);
    try {
      await verifyTotp(challengeToken, code.trim());
      onSignedIn();
    } catch (error) {
      if (error instanceof ApiError || error instanceof NetworkError) setFormError(error.message);
      else setFormError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (challengeToken) {
    return (
      <AuthCard title="Enter your code" subtitle="From your authenticator app, or one of your backup codes." footer={null}>
        <form noValidate onSubmit={handleVerify} className="flex flex-col gap-5">
          <FormField
            label="Authentication code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            placeholder="123456"
            onChange={(event) => setCode(event.target.value)}
          />

          {formError && (
            <p role="alert" className="rounded-md border border-danger px-4 py-3 text-sm text-text">
              {formError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending || !code.trim()}>
            {pending ? 'Verifying…' : 'Verify'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => {
              setChallengeToken(null);
              setCode('');
              setFormError(null);
            }}
          >
            Back to sign in
          </Button>
        </form>
      </AuthCard>
    );
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
