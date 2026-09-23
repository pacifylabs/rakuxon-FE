'use client';

import { Copy, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, EmptyState, FormField, StatusBadge, useToast } from '@rakuxon/ui';
import type { OnboardingLinkSummary } from '@rakuxon/contract';

function statusOf(link: OnboardingLinkSummary): {
  label: string;
  tone: 'positive' | 'neutral' | 'negative';
} {
  if (link.revokedAt) return { label: 'Revoked', tone: 'negative' };
  if (link.consumedAt) return { label: 'Used', tone: 'neutral' };
  if (new Date(link.expiresAt).getTime() <= Date.now())
    return { label: 'Expired', tone: 'negative' };
  return { label: 'Active', tone: 'positive' };
}

export default function InvitePage() {
  const { apiClient } = useAuth();
  const toast = useToast();

  const [links, setLinks] = useState<OnboardingLinkSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [issuedUrl, setIssuedUrl] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await apiClient.listOnboardingLinks();
      setLinks(result.items);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load your invitations. Please try again.',
      );
    }
  }, [apiClient]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const inviteeEmail = String(data.get('inviteeEmail') ?? '').trim();
    if (!inviteeEmail) return;

    setPending(true);
    setIssuedUrl(null);
    try {
      const issued = await apiClient.issueOnboardingLink({ inviteeEmail });
      setIssuedUrl(issued.url);
      form.reset();
      toast.success('Invitation link created.');
      await load();
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not create the invitation. Please try again.';
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!issuedUrl) return;
    try {
      await navigator.clipboard.writeText(issuedUrl);
      toast.success('Copied to clipboard.');
    } catch {
      /* Clipboard access can be denied by the browser — the link is still shown, selectable by hand. */
    }
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    try {
      await apiClient.revokeOnboardingLink(id);
      toast.success('Invitation revoked.');
      await load();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not revoke that invitation. Please try again.',
      );
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <section aria-labelledby="invite-heading">
      <h1 id="invite-heading" className="font-heading text-3xl font-bold text-text">
        Invite students
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Issue a link a student can use to create their own account directly into your agency.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-4">
        <FormField
          label="Student's email"
          name="inviteeEmail"
          type="email"
          autoComplete="off"
          required
        />
        <div>
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending ? 'Creating…' : 'Create invitation'}
          </Button>
        </div>
      </form>

      {issuedUrl && (
        <div className="mt-6 flex max-w-2xl flex-wrap items-center gap-3 rounded-md border border-border bg-surface-muted p-4">
          <p className="min-w-0 flex-1 break-all font-mono text-sm text-text">{issuedUrl}</p>
          <Button variant="ghost" size="md" onClick={copyLink}>
            <Copy aria-hidden="true" className="size-4" />
            Copy
          </Button>
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-text">Invitations</h2>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        {!links && !error && (
          <p role="status" className="mt-4 text-sm text-text-muted">
            Loading…
          </p>
        )}

        {links && links.length === 0 && (
          <div className="mt-4">
            <EmptyState
              icon={UserPlus}
              title="No invitations yet"
              description="Create one above to bring a student directly onto your agency."
            />
          </div>
        )}

        {links && links.length > 0 && (
          <ul className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
            {links.map((link) => {
              const status = statusOf(link);
              const revocable = status.label === 'Active';
              return (
                <li key={link.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-heading text-sm font-semibold text-text">
                      {link.inviteeEmail}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Issued {new Date(link.createdAt).toLocaleDateString()} · expires{' '}
                      {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    {revocable && (
                      <Button
                        variant="ghost"
                        size="md"
                        disabled={revokingId === link.id}
                        onClick={() => handleRevoke(link.id)}
                      >
                        {revokingId === link.id ? 'Revoking…' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
