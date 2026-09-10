'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SignInForm, SsoButton } from '@rakuxon/auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  /* window is not available during the server render, and the redirect URI
     must match what the provider was given exactly. */
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    setRedirectUri(`${window.location.origin}/sso/callback`);
  }, []);

  return (
    <SignInForm
      subtitle="Search, shortlist and track your applications."
      onSignedIn={() => router.push('/dashboard')}
      ownsMainLandmark={false}
      forgotPasswordHref="/forgot-password"
      // Passed only when SSO is actually configured: SignInForm draws an "or"
      // separator above whatever it is given, and a separator with nothing
      // above it looks like a rendering failure.
      above={
        GOOGLE_CLIENT_ID && redirectUri ? (
          <SsoButton clientId={GOOGLE_CLIENT_ID} redirectUri={redirectUri} />
        ) : null
      }
      footer={
        <>
          No account yet?{' '}
          <a href="/register" className="rounded-sm font-semibold text-primary underline">
            Create one
          </a>
        </>
      }
    />
  );
}
