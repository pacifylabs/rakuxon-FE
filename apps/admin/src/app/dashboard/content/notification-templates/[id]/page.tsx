'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, Switch, useToast } from '@rakuxon/ui';
import type { NotificationTemplateDetail, NotificationTemplatePreview } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';
import { CHANNEL_LABELS, templateKeyLabel } from '../labels';

interface FormState {
  subject: string;
  heading: string;
  body: string[];
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
  enabled: boolean;
}

function fromDetail(detail: NotificationTemplateDetail): FormState {
  return {
    subject: detail.subject ?? '',
    heading: detail.heading,
    body: detail.body.length > 0 ? detail.body : [''],
    ctaLabel: detail.ctaLabel ?? '',
    ctaUrl: detail.ctaUrl ?? '',
    footnote: detail.footnote ?? '',
    enabled: detail.enabled,
  };
}

function NotificationTemplateEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();

  const [detail, setDetail] = useState<NotificationTemplateDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NotificationTemplatePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const loaded = await client.getNotificationTemplateDetail(params.id);
      setDetail(loaded);
      setForm(fromDetail(loaded));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this template. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Debounced: a preview call per keystroke would hammer the API, and the
     draft copy is only ever a few hundred milliseconds from settling. */
  useEffect(() => {
    if (!form) return;
    const handle = setTimeout(() => {
      client
        .previewNotificationTemplate(params.id, {
          subject: form.subject || undefined,
          heading: form.heading,
          body: form.body.filter((paragraph) => paragraph.trim() !== ''),
          ctaLabel: form.ctaLabel || undefined,
          ctaUrl: form.ctaUrl || undefined,
          footnote: form.footnote || undefined,
        })
        .then((result) => {
          setPreview(result);
          setPreviewError(null);
        })
        .catch((caught) => {
          setPreviewError(
            caught instanceof ApiError || caught instanceof NetworkError
              ? caught.message
              : 'Could not render a preview.',
          );
        });
    }, 400);
    return () => clearTimeout(handle);
  }, [client, params.id, form]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function setParagraph(index: number, value: string) {
    setForm((current) => {
      if (!current) return current;
      const body = [...current.body];
      body[index] = value;
      return { ...current, body };
    });
  }

  function addParagraph() {
    setForm((current) => (current ? { ...current, body: [...current.body, ''] } : current));
  }

  function removeParagraph(index: number) {
    setForm((current) => {
      if (!current) return current;
      const body = current.body.filter((_, i) => i !== index);
      return { ...current, body: body.length > 0 ? body : [''] };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    try {
      const saved = await client.updateNotificationTemplate(params.id, {
        subject: form.subject || null,
        heading: form.heading,
        body: form.body.filter((paragraph) => paragraph.trim() !== ''),
        ctaLabel: form.ctaLabel || null,
        ctaUrl: form.ctaUrl || null,
        footnote: form.footnote || null,
        enabled: form.enabled,
      });
      setDetail(saved);
      setForm(fromDetail(saved));
      toast.success('Notification template saved.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this template. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="text-base text-text-muted">
        Loading…
      </p>
    );
  }

  if (!detail || !form) {
    return (
      <p role="alert" className="text-base text-danger">
        {error ?? 'This template could not be found.'}
      </p>
    );
  }

  const showEmailFields = detail.channel !== 'in_app';
  const showInAppPreview = detail.channel !== 'email';

  return (
    <section aria-labelledby="notification-template-editor-heading">
      <h1 id="notification-template-editor-heading" className="font-heading text-3xl font-bold text-text">
        {templateKeyLabel(detail.key)}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Sends via {(CHANNEL_LABELS[detail.channel] ?? detail.channel).toLowerCase()}. Disabling this
        row falls back to the built-in default copy — nothing stops sending.
      </p>

      {detail.availableTokens.length > 0 && (
        <p className="mt-4 max-w-prose text-sm text-text-muted">
          Tokens this message fills in:{' '}
          {detail.availableTokens.map((token) => (
            <code key={token} className="mr-2 rounded bg-surface-muted px-1.5 py-0.5 text-xs">
              {`{{${token}}}`}
            </code>
          ))}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-4">
            <Switch checked={form.enabled} onChange={() => set('enabled', !form.enabled)} label="Enabled" />
            <span className="text-sm text-text">
              <span className="font-semibold text-text">{form.enabled ? 'Enabled' : 'Disabled'}</span>
              <span className="ml-1 text-text-muted">
                {form.enabled ? '— using the copy below.' : '— using the built-in default copy instead.'}
              </span>
            </span>
          </div>

          {showEmailFields && (
            <FormField
              label="Email subject"
              name="subject"
              defaultValue={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              required
            />
          )}

          <FormField
            label="Heading"
            name="heading"
            hint="Also the in-app notification's title, when this message shows in the bell."
            defaultValue={form.heading}
            onChange={(e) => set('heading', e.target.value)}
            required
          />

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-text">Body</span>
            {form.body.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={paragraph}
                  onChange={(event) => setParagraph(index, event.target.value)}
                  rows={3}
                  required={index === 0}
                  aria-label={`Paragraph ${index + 1}`}
                  className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                />
                {form.body.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    aria-label={`Remove paragraph ${index + 1}`}
                    className="shrink-0 rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <p className="text-xs text-text-muted">
              {showInAppPreview ? 'The in-app notification uses only the first paragraph.' : ''}
            </p>
            <Button type="button" variant="ghost" size="md" onClick={addParagraph}>
              <Plus aria-hidden="true" className="size-4" />
              Add paragraph
            </Button>
          </div>

          {showEmailFields && (
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                label="Button label"
                name="ctaLabel"
                defaultValue={form.ctaLabel}
                onChange={(e) => set('ctaLabel', e.target.value)}
              />
              <FormField
                label="Button link"
                name="ctaUrl"
                placeholder="{{reviewUrl}}"
                defaultValue={form.ctaUrl}
                onChange={(e) => set('ctaUrl', e.target.value)}
              />
            </div>
          )}

          {showEmailFields && (
            <FormField
              label="Footnote"
              name="footnote"
              hint="The small print under the button — an expiry note, a “didn't request this?” line."
              defaultValue={form.footnote}
              onChange={(e) => set('footnote', e.target.value)}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push('/dashboard/content/notification-templates')}
            >
              Back
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <h2 className="font-heading text-lg font-semibold text-text">Live preview</h2>
          <p className="-mt-4 text-sm text-text-muted">
            Rendered against sample data — nothing here is saved until you click Save.
          </p>

          {previewError && (
            <p role="alert" className="text-sm text-danger">
              {previewError}
            </p>
          )}

          {showEmailFields && (
            <div className="rounded-lg border border-border">
              <div className="border-b border-border bg-surface-muted px-4 py-3">
                <p className="text-xs font-semibold text-text-muted">Email</p>
                <p className="text-sm font-semibold text-text">{preview?.subject || form.subject}</p>
              </div>
              <iframe
                title="Email preview"
                srcDoc={preview?.html ?? ''}
                sandbox=""
                style={{ height: 420, width: '100%', border: 0 }}
              />
            </div>
          )}

          {showInAppPreview && (
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-semibold text-text-muted">In-app notification (the bell)</p>
              <p className="mt-2 text-sm font-semibold text-text">{preview?.inAppTitle ?? form.heading}</p>
              <p className="mt-1 text-sm text-text-muted">{preview?.inAppBody ?? form.body[0]}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function NotificationTemplateEditorPage() {
  return (
    <RequirePermission
      permissions={['notifications.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to edit notification templates.
        </p>
      }
    >
      <NotificationTemplateEditor />
    </RequirePermission>
  );
}
