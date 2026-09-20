'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, PresenceDot, useToast } from '@rakuxon/ui';
import type { ConversationDetail } from '@rakuxon/contract';

import { useAdminApiClient } from '@/lib/admin-auth';

const THREAD_POLL_MS = 20_000;

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

export default function AdminConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setConversation(await client.getConversation(params.id));
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught, 'Could not load this conversation. Please try again.'));
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), THREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      setConversation(await client.replyToConversation(params.id, { body: draft.trim() }));
      setDraft('');
    } catch (caught) {
      toast.error(errorMessage(caught, 'Could not send that message. Please try again.'));
    } finally {
      setSending(false);
    }
  }

  if (error) {
    return (
      <section aria-labelledby="conversation-heading">
        <h1 id="conversation-heading" className="font-heading text-3xl font-bold text-text">
          Messages
        </h1>
        <p role="alert" className="mt-4 text-base text-danger">
          {error}
        </p>
      </section>
    );
  }

  if (!conversation) {
    return (
      <section aria-labelledby="conversation-heading">
        <h1 id="conversation-heading" className="font-heading text-3xl font-bold text-text">
          Messages
        </h1>
        <p role="status" className="mt-4 text-base text-text-muted">
          Loading…
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="conversation-heading">
      <button
        type="button"
        onClick={() => router.push('/dashboard/messages')}
        className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
      >
        ← All messages
      </button>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 id="conversation-heading" className="font-heading text-3xl font-bold text-text">
          {conversation.counterpartName}
        </h1>
        <PresenceDot online={conversation.counterpartOnline} />
      </div>

      <ol className="mt-6 flex flex-col gap-3">
        {conversation.messages.map((message) => {
          const mine = message.senderType === 'admin';
          return (
            <li key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  mine ? 'bg-primary text-on-primary' : 'border border-border bg-surface text-text'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                <p className={`mt-1 text-xs ${mine ? 'text-on-primary opacity-80' : 'text-text-muted'}`}>
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSend} className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Type your reply…"
          required
          className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
        />
        <Button type="submit" variant="primary" size="md" disabled={sending} className="self-start">
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </section>
  );
}
