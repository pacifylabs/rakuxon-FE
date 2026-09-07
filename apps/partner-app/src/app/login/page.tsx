'use client';

import { useRouter } from 'next/navigation';

import { SignInForm } from '@rakuxon/auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInForm
      subtitle="Access your student pipeline, documents and applications."
      onSignedIn={() => router.push('/dashboard')}
      footer={
        <>
          No account yet?{' '}
          <a href="/register" className="rounded-sm font-semibold text-primary underline">
            Register your agency
          </a>
        </>
      }
    />
  );
}
