'use client';

import { ChevronRight, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, EmptyState } from '@rakuxon/ui';
import type { ConversationSummary } from '@rakuxon/contract';

import { useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

export default function AdminMessagesPage() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setConversations(await client.listConversations());
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load your conversations. Please try again.'));
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section aria-labelledby="messages-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="messages-heading" className="font-heading text-3xl font-bold text-text">
            Messages
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Your own conversations with the students assigned to you.
          </p>
        </div>
        {hasPermission('messaging.manage') && (
          <Button variant="primary" size="md" onClick={() => window.location.assign('/dashboard/messages/compose')}>
            New message
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!conversations && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {conversations && conversations.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="Once a student assigned to you sends a message, or you compose one, it shows up here."
          />
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <a
                href={`/dashboard/messages/${conversation.id}`}
                className="flex items-center gap-4 rounded-md border border-border bg-surface p-5 transition-colors hover:bg-surface-muted"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted">
                  <MessageCircle aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold text-text">{conversation.counterpartName}</p>
                  {conversation.lastMessage && (
                    <p className="mt-1 truncate text-sm text-text-muted">{conversation.lastMessage}</p>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-danger text-xs font-bold text-on-primary">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                )}
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-text-muted" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
