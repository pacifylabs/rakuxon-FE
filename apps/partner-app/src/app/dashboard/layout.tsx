'use client';

import { ClipboardList, GraduationCap, LayoutGrid, School, UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { GuardedPage, useAuth } from '@rakuxon/auth';
import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellNavItem } from '@rakuxon/ui';

import { VerifyEmailBanner } from '@/components/dashboard/VerifyEmailBanner';

/**
 * No notifications bell, messages panel or heartbeat here — all three ride
 * on `Role.Student`-only backend routes (`/notifications`, `/messages`,
 * `/students/me/heartbeat`). An agency_admin/counselor token gets a 403 from
 * every one of them, so wiring the admin/base-site shell pattern in as-is
 * would just poll a dead endpoint every 25s. Messaging staying out of the
 * agency's reach at all is itself a locked-in scope decision (see the plan's
 * Context section) — this is that decision, reflected in the shell.
 */
function navItems(
  hasRole: (...roles: ('agency_admin' | 'counselor')[]) => boolean,
): AppShellNavItem[] {
  return [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/students', label: 'Students', icon: GraduationCap },
    { href: '/dashboard/applications', label: 'Applications', icon: ClipboardList },
    { href: '/dashboard/invite', label: 'Invite students', icon: UserPlus },
    { href: '/dashboard/schools', label: 'Schools', icon: School },
    ...(hasRole('agency_admin') ? [{ href: '/dashboard/staff', label: 'Staff', icon: Users }] : []),
  ];
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, signOut, hasRole } = useAuth();

  return (
    <GuardedPage
      roles={['agency_admin', 'counselor']}
      onUnauthenticated={() => router.replace('/auth/login')}
      wrongRole={
        <div className="mx-auto max-w-prose px-5 py-16 text-center">
          <Wordmark href="/" />
          <h1 className="mt-8 font-heading text-2xl font-bold text-text">
            This workspace is not for your account
          </h1>
          <p className="mt-4 text-base text-text-muted">
            You are signed in, but this area is limited to partner agency accounts.
          </p>
        </div>
      }
    >
      <AppShell
        showThemeToggle
        navItems={navItems(hasRole)}
        homeHref="/dashboard"
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
        userEmail={user?.email}
        onSignOut={async () => {
          await signOut();
          router.push('/auth/login');
        }}
        badge="Partner"
        accountMenu={{ profileHref: '/dashboard/settings', securityHref: '/dashboard/settings' }}
      >
        {user && !user.emailVerifiedAt && <VerifyEmailBanner email={user.email} />}
        {children}
      </AppShell>
    </GuardedPage>
  );
}
