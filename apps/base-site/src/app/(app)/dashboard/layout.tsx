'use client';

import { Building2, ClipboardList, FileText, Home, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { GuardedPage, useAuth } from '@rakuxon/auth';
import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellNavItem } from '@rakuxon/ui';

import { VerifyEmailBanner } from '@/components/dashboard/VerifyEmailBanner';

const NAV_ITEMS: AppShellNavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/schools', label: 'Schools', icon: Building2 },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/applications', label: 'Applications', icon: ClipboardList },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <GuardedPage
      roles={['student']}
      onUnauthenticated={() => router.replace('/login')}
      wrongRole={
        <div className="mx-auto max-w-prose px-5 py-16 text-center">
          <Wordmark href="/" />
          <h1 className="mt-8 font-heading text-2xl font-bold text-text">
            This dashboard is not for your account
          </h1>
          <p className="mt-4 text-base text-text-muted">
            You are signed in, but this area is limited to applicant accounts.
          </p>
        </div>
      }
    >
      <AppShell
        navItems={NAV_ITEMS}
        homeHref="/dashboard"
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
        userEmail={user?.email}
        onSignOut={async () => {
          await signOut();
          router.push('/login');
        }}
      >
        {user && !user.emailVerifiedAt && <VerifyEmailBanner email={user.email} />}
        {children}
      </AppShell>
    </GuardedPage>
  );
}
