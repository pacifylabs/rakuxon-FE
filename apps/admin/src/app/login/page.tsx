'use client';

import { useRouter } from 'next/navigation';

import { AdminSignInForm } from '@/lib/admin-auth';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AdminSignInForm
      subtitle="Administer tenants, the catalogue and platform configuration."
      onSignedIn={() => router.push('/dashboard')}
    />
  );
}
