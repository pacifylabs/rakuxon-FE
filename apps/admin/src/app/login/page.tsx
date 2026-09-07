'use client';

import { useRouter } from 'next/navigation';

import { SignInForm } from '@rakuxon/auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInForm
      subtitle="Administer tenants, the catalogue and platform configuration."
      onSignedIn={() => router.push('/dashboard')}
    />
  );
}
