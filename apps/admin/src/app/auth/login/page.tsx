'use client';

import { useRouter } from 'next/navigation';

import { AdminSignInForm } from '@/lib/admin-auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AdminSignInForm
      subtitle="Administer partners, the catalogue and platform configuration."
      onSignedIn={() => router.push('/dashboard')}
    />
  );
}
