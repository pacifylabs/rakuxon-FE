'use client';

import { Building2, ClipboardList, FileText, Home, MessageCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { GuardedPage, useApiClient, useAuth } from '@rakuxon/auth';
import { AppShell, Wordmark } from '@rakuxon/ui';
import type { AppShellConversationItem, AppShellNavItem, AppShellNotificationItem } from '@rakuxon/ui';
import type { ConversationSummary, Notification } from '@rakuxon/contract';

import { VerifyEmailBanner } from '@/components/dashboard/VerifyEmailBanner';

/** Matches the "chat/presence: polling-based, refetch every 20-30s" decision — no push channel exists yet. */
const MESSAGES_POLL_MS = 25_000;
/** Comfortably inside the backend's 2-minute "online" window, so one missed tick never flickers offline. */
const HEARTBEAT_POLL_MS = 60_000;

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
    counterpartOnline: conversation.counterpartOnline,
    lastMessage: conversation.lastMessage ?? null,
    unreadCount: conversation.unreadCount,
  };
}

const NAV_ITEMS: AppShellNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/schools', label: 'Schools', icon: Building2 },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/applications', label: 'Applications', icon: ClipboardList },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageCircle },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const client = useApiClient();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);

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

  useEffect(() => {
    if (!user) return;
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
  }, [client, user]);

  useEffect(() => {
    if (!user) return;
    const beat = () => {
      client.heartbeat().catch(() => {
        /* A missed heartbeat just means one fewer "online" tick for others to see — never worth surfacing. */
      });
    };
    beat();
    const interval = setInterval(beat, HEARTBEAT_POLL_MS);
    return () => clearInterval(interval);
  }, [client, user]);

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
    <GuardedPage
      roles={['student']}
      onUnauthenticated={() => router.replace('/auth/login')}
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
          router.push('/auth/login');
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
        {user && !user.emailVerifiedAt && <VerifyEmailBanner email={user.email} />}
        {children}
      </AppShell>
    </GuardedPage>
  );
}
