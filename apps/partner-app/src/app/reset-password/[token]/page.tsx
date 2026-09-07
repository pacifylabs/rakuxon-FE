'use client';

import { useParams, useRouter } from 'next/navigation';

import { ConfirmPasswordResetForm } from '@rakuxon/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();

  return (
    <ConfirmPasswordResetForm
      baseUrl={API_BASE_URL}
      token={token}
      /* Every session was just revoked, so sign-in is the only place to go. */
      onComplete={() => router.push('/login')}
    />
  );
}
