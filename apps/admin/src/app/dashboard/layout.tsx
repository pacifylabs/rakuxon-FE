'use client';

import {
  Bell,
  Building2,
  BookOpen,
  CalendarDays,
  Compass,
  GraduationCap,
  Globe2,
  Landmark,
  LayoutGrid,
  MessageCircle,
  MessageSquareQuote,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellConversationItem, AppShellNavItem, AppShellNotificationItem } from '@rakuxon/ui';
import type { ConversationSummary, Notification } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

/** Matches the "chat/presence: polling-based, refetch every 20-30s" decision — no push channel exists yet. */
const MESSAGES_POLL_MS = 25_000;

function toShellItem(notification: Notification): AppShellNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    readAt: notification.readAt,
  };
}

function toShellConversation(conversation: ConversationSummary): AppShellConversationItem {
  return {
    id: conversation.id,
    counterpartName: conversation.counterpartName,
    lastMessage: conversation.lastMessage ?? null,
    unreadCount: conversation.unreadCount,
  };
}

function navItems(hasPermission: (key: string) => boolean): AppShellNavItem[] {
  return [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/tenants', label: 'Partners', icon: ShieldCheck },
    {
      label: 'Catalogue',
      icon: Building2,
      children: [
        { href: '/dashboard/catalogue/institutions', label: 'Institutions', icon: Landmark },
        { href: '/dashboard/catalogue/courses', label: 'Courses', icon: GraduationCap },
        { href: '/dashboard/catalogue/articles', label: 'Articles', icon: BookOpen },
      ],
    },
    {
      label: 'Content',
      icon: MessageSquareQuote,
      children: [
        { href: '/dashboard/content/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
        { href: '/dashboard/content/services', label: 'Services', icon: Compass },
        { href: '/dashboard/content/destinations', label: 'Destinations', icon: Globe2 },
        { href: '/dashboard/content/site-settings', label: 'Site settings', icon: Settings },
        { href: '/dashboard/content/notification-templates', label: 'Notification templates', icon: Bell },
      ],
    },
    { href: '/dashboard/applications', label: 'Applications', icon: Users },
    { href: '/dashboard/students', label: 'Applicants', icon: GraduationCap },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
    {
      label: 'Admins',
      icon: Users,
      children: [
        { href: '/dashboard/admins', label: 'Administrators', icon: Users },
        { href: '/dashboard/admins/roles', label: 'Roles & permissions', icon: ShieldCheck },
      ],
    },
    {
      label: 'Utilities',
      icon: Wrench,
      children: [
        { href: '/dashboard/utilities/countries', label: 'Countries', icon: Globe2 },
        { href: '/dashboard/utilities/intake-terms', label: 'Intake terms', icon: CalendarDays },
      ],
    },
    ...(hasPermission('platform.audit')
      ? [{ href: '/dashboard/activity-log', label: 'Activity log', icon: ScrollText }]
      : []),
  ];
}

/**
 * Shared shell for every /dashboard/* screen — wraps RequirePermission once
 * (the dashboard home needs no specific permission, only being signed in;
 * individual subpages gate their own content further) and renders AppShell,
 * which has no dependency on any auth package and is already shared with
 * apps/base-site's dashboard.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { admin, signOut, hasPermission } = useAdminAuth();
  const client = useAdminApiClient();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);

  useEffect(() => {
    if (!admin) return;
    client
      .listNotifications()
      .then(setNotifications)
      .catch(() => {
        /* The bell falling back to "nothing here yet" is a fine outcome for a
           failed fetch — nothing on this page depends on notifications loading. */
      });
  }, [client, admin]);

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    const load = () => {
      client
        .listConversations()
        .then((result) => {
          if (!cancelled) setConversations(result);
        })
        .catch(() => {
          /* Same fallback reasoning as notifications above — a failed poll just tries again next tick. */
        });
    };
    load();
    const interval = setInterval(load, MESSAGES_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [client, admin]);

  async function handleOpenNotification(id: string) {
    const target = notifications?.find((notification) => notification.id === id);
    if (!target) return;

    setNotifications((current) =>
      (current ?? []).map((notification) =>
        notification.id === id
          ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
          : notification,
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

  function handleOpenConversation(id: string) {
    router.push(`/dashboard/messages/${id}`);
  }

  return (
    <RequirePermission
      onUnauthenticated={() => router.replace('/auth/login')}
      fallback={<p className="p-8 text-base text-text-muted">Checking your session…</p>}
      denied={
        <main className="grid min-h-screen place-items-center px-5">
          <div className="max-w-prose text-center">
            <Wordmark href="/" />
            <h1 className="mt-8 font-heading text-2xl font-bold text-text">
              Redirecting to sign in…
            </h1>
          </div>
        </main>
      }
    >
      <AppShell
        navItems={navItems(hasPermission)}
        homeHref="/dashboard"
        userName={admin ? `${admin.firstName} ${admin.lastName}` : undefined}
        userEmail={admin?.email}
        onSignOut={async () => {
          await signOut();
          router.push('/auth/login');
        }}
        badge="Admin"
        accountMenu={{
          profileHref: '/dashboard/settings/profile',
          securityHref: '/dashboard/settings/security',
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
        messages={
          conversations
            ? {
                items: conversations.map(toShellConversation),
                unreadCount: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
                onOpen: handleOpenConversation,
                href: '/dashboard/messages',
              }
            : undefined
        }
      >
        {children}
      </AppShell>
    </RequirePermission>
  );
}
