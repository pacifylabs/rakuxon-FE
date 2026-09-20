'use client';

import { ChevronRight, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { Button, EmptyState, PresenceDot, useToast } from '@rakuxon/ui';
import type { AssignedAdmin, ConversationSummary } from '@rakuxon/contract';

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

export default function MessagesPage() {
  const client = useApiClient();
  const toast = useToast();

  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [assignedAdmins, setAssignedAdmins] = useState<AssignedAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [recipientId, setRecipientId] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [conversationList, admins] = await Promise.all([
          client.listConversations(),
          client.listAssignedAdmins(),
        ]);
        if (cancelled) return;
        setConversations(conversationList);
        setAssignedAdmins(admins);
        setRecipientId((current) => current || admins[0]?.id || '');
        setError(null);
      } catch (caught) {
        if (!cancelled) setError(errorMessage(caught, 'Could not load your messages. Please try again.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipientId || !draft.trim()) return;
    setSending(true);
    try {
      const conversation = await client.startConversation({ adminId: recipientId, body: draft.trim() });
      window.location.assign(`/dashboard/messages/${conversation.id}`);
    } catch (caught) {
      toast.error(errorMessage(caught, 'Could not send that message. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  const loading = !conversations || !assignedAdmins;

  return (
    <section aria-labelledby="messages-heading">
      <h1 id="messages-heading" className="font-heading text-3xl font-bold text-text">
        Messages
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Chat directly with the success manager assigned to your case.
      </p>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {loading && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {!loading && assignedAdmins && assignedAdmins.length > 0 && (
        <form onSubmit={handleSend} className="mt-6 rounded-md border border-border bg-surface p-5">
          <h2 className="font-heading text-lg font-semibold text-text">New message</h2>
          <div className="mt-4 flex flex-col gap-3">
            {assignedAdmins.length > 1 && (
              <label className="flex flex-col gap-1 text-sm text-text">
                To
                <select
                  value={recipientId}
                  onChange={(event) => setRecipientId(event.target.value)}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  {assignedAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.firstName} {admin.lastName} — {admin.online ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {assignedAdmins.length === 1 && (
              <p className="flex items-center gap-2 text-sm text-text-muted">
                To: <span className="font-semibold text-text">{assignedAdmins[0]!.firstName} {assignedAdmins[0]!.lastName}</span>
                <PresenceDot online={assignedAdmins[0]!.online} />
              </p>
            )}
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder="Type your message…"
              required
              className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            />
            <Button type="submit" variant="primary" size="md" disabled={sending} className="self-start">
              <Send aria-hidden="true" className="size-4" />
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      )}

      {!loading && assignedAdmins && assignedAdmins.length === 0 && conversations && conversations.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={MessageCircle}
            title="No one assigned yet"
            description="Once your application is submitted, a success manager is assigned to your case automatically — you'll be able to message them here."
          />
        </div>
      )}

      {!loading && conversations && conversations.length > 0 && (
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-text">{conversation.counterpartName}</p>
                    <PresenceDot online={conversation.counterpartOnline} />
                  </div>
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
