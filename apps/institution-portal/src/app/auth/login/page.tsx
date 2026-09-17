'use client';

import { useRouter } from 'next/navigation';

import { SignInForm } from '@rakuxon/auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInForm
      subtitle="Review the applications routed to your institution."
      onSignedIn={() => router.push('/dashboard')}
    />
  );
}
