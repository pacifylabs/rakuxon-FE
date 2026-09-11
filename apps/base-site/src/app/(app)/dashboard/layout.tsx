'use client';

import { Building2, ClipboardList, FileText, Home, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { GuardedPage, useApiClient, useAuth } from '@rakuxon/auth';
import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellNavItem, AppShellNotificationItem } from '@rakuxon/ui';
import type { Notification } from '@rakuxon/contract';

import { VerifyEmailBanner } from '@/components/dashboard/VerifyEmailBanner';

function toShellItem(notification: Notification): AppShellNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    readAt: notification.readAt,
  };
}

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
  const client = useApiClient();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    if (!user) return;
    client
      .listNotifications()
      .then(setNotifications)
      .catch(() => {
        /* The bell falling back to "nothing here yet" is a fine outcome for a
           failed fetch — nothing on this page depends on notifications loading. */
      });
  }, [client, user]);

  async function handleOpenNotification(id: string) {
    const target = notifications?.find((notification) => notification.id === id);
    if (!target) return;

    setNotifications((current) =>
      (current ?? []).map((notification) =>
        notification.id === id ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() } : notification,
      ),
    );

    try {
      await client.markNotificationRead(id);
    } catch {
      /* The optimistic update already reflects "read" — a failed confirmation
         is not worth surfacing over what is a low-stakes housekeeping call. */
    }

    if (target.link) router.push(target.link);
  }

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
        notifications={
          notifications
            ? {
                items: notifications.map(toShellItem),
                unreadCount: notifications.filter((notification) => !notification.readAt).length,
                onOpen: handleOpenNotification,
              }
            : undefined
        }
      >
        {user && !user.emailVerifiedAt && <VerifyEmailBanner email={user.email} />}
        {children}
      </AppShell>
    </GuardedPage>
  );
}
