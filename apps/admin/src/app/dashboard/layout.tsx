'use client';

import { Building2, BookOpen, GraduationCap, Globe2, Landmark, LayoutGrid, ShieldCheck, Users, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellNavItem } from '@rakuxon/ui';

import { RequirePermission, useAdminAuth } from '@/lib/admin-auth';

const NAV_ITEMS: AppShellNavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/dashboard/tenants', label: 'Tenants', icon: ShieldCheck },
  {
    label: 'Catalogue',
    icon: Building2,
    children: [
      { href: '/dashboard/catalogue/institutions', label: 'Institutions', icon: Landmark },
      { href: '/dashboard/catalogue/courses', label: 'Courses', icon: GraduationCap },
      { href: '/dashboard/catalogue/articles', label: 'Articles', icon: BookOpen },
    ],
  },
  { href: '/dashboard/applications', label: 'Applications', icon: Users },
  { href: '/dashboard/students', label: 'Students', icon: GraduationCap },
  { href: '/dashboard/admins', label: 'Admins', icon: Users },
  {
    label: 'Utilities',
    icon: Wrench,
    children: [{ href: '/dashboard/utilities/countries', label: 'Countries', icon: Globe2 }],
  },
];

/**
 * Shared shell for every /dashboard/* screen — wraps RequirePermission once
 * (the dashboard home needs no specific permission, only being signed in;
 * individual subpages gate their own content further) and renders AppShell,
 * which has no dependency on any auth package and is already shared with
 * apps/base-site's dashboard.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { admin, signOut } = useAdminAuth();

  return (
    <RequirePermission
      onUnauthenticated={() => router.replace('/login')}
      fallback={<p className="p-8 text-base text-text-muted">Checking your session…</p>}
      denied={
        <main className="grid min-h-screen place-items-center px-5">
          <div className="max-w-prose text-center">
            <Wordmark href="/" />
            <h1 className="mt-8 font-heading text-2xl font-bold text-text">Redirecting to sign in…</h1>
          </div>
        </main>
      }
    >
      <AppShell
        navItems={NAV_ITEMS}
        homeHref="/dashboard"
        userName={admin ? `${admin.firstName} ${admin.lastName}` : undefined}
        userEmail={admin?.email}
        onSignOut={async () => {
          await signOut();
          router.push('/login');
        }}
        badge="Admin"
        accountMenu={{
          profileHref: '/dashboard/settings/profile',
          securityHref: '/dashboard/settings/security',
        }}
      >
        {children}
      </AppShell>
    </RequirePermission>
  );
}
