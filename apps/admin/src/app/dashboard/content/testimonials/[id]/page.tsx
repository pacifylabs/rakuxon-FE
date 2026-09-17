'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type { AdminTestimonialDetail } from '@rakuxon/contract';

import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

type Placement = 'home' | 'students';
const PLACEMENTS: { value: Placement; label: string }[] = [
  { value: 'home', label: 'Homepage' },
  { value: 'students', label: 'Students page' },
];

interface FormState {
  quote: string;
  authorName: string;
  detail: string;
  photoUrl: string;
  consentGiven: boolean;
  placement: Placement[];
  displayOrder: string;
}

const BLANK: FormState = {
  quote: '',
  authorName: '',
  detail: '',
  photoUrl: '',
  consentGiven: false,
  placement: [],
  displayOrder: '0',
};

function fromDetail(detail: AdminTestimonialDetail): FormState {
  return {
    quote: detail.quote,
    authorName: detail.authorName,
    detail: detail.detail,
    photoUrl: detail.photoUrl ?? '',
    consentGiven: detail.consentGiven,
    placement: detail.placement as Placement[],
    displayOrder: String(detail.displayOrder),
  };
}

function TestimonialEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const isNew = params.id === 'new';

  const [form, setForm] = useState<FormState>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      setForm(fromDetail(await client.getTestimonialDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this testimonial. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [client, isNew, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePlacement(value: Placement) {
    setForm((current) => ({
      ...current,
      placement: current.placement.includes(value)
        ? current.placement.filter((entry) => entry !== value)
        : [...current.placement, value],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        const created = await client.createTestimonial({
          quote: form.quote,
          authorName: form.authorName,
          detail: form.detail,
          photoUrl: form.photoUrl || undefined,
          consentGiven: form.consentGiven,
          placement: form.placement,
          displayOrder: Number(form.displayOrder) || 0,
        });
        router.push(`/dashboard/content/testimonials/${created.id}`);
      } else {
        await client.updateTestimonial(params.id, {
          quote: form.quote,
          authorName: form.authorName,
          detail: form.detail,
          photoUrl: form.photoUrl || null,
          consentGiven: form.consentGiven,
          placement: form.placement,
          displayOrder: Number(form.displayOrder) || 0,
        });
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this testimonial. Please try again.',
      );
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

  return (
    <section aria-labelledby="testimonial-editor-heading">
      <h1 id="testimonial-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New testimonial' : 'Edit testimonial'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the testimonials list — this screen is
        the record's own fields only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="quote" className="text-sm font-medium text-text">
            Quote
          </label>
          <textarea
            id="quote"
            value={form.quote}
            onChange={(event) => set('quote', event.target.value)}
            rows={5}
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="Author name"
            name="authorName"
            defaultValue={form.authorName}
            onChange={(e) => set('authorName', e.target.value)}
            required
          />
          <FormField
            label="Detail"
            name="detail"
            placeholder="e.g. Oxford University, UK"
            defaultValue={form.detail}
            onChange={(e) => set('detail', e.target.value)}
            required
          />
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <label className="flex items-start gap-3 text-sm text-text">
            <input
              type="checkbox"
              checked={form.consentGiven}
              onChange={(event) => {
                const checked = event.target.checked;
                set('consentGiven', checked);
                if (!checked) set('photoUrl', '');
              }}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold text-text">This person has consented to a photo.</span>
              <span className="mt-1 block text-text-muted">
                Required before a photo can be uploaded — a stock or unconsented photo under a real
                name is a misrepresentation, not decoration.
              </span>
            </span>
          </label>

          <div className="mt-4">
            <ImageUploadField
              label={form.consentGiven ? 'Photo' : 'Photo (requires consent above)'}
              folder="testimonials"
              value={form.photoUrl}
              onChange={(url) => set('photoUrl', url)}
              disabled={!form.consentGiven}
            />
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-text">Shown on</legend>
          <div className="flex flex-wrap gap-4">
            {PLACEMENTS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={form.placement.includes(option.value)}
                  onChange={() => togglePlacement(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <FormField
          label="Display order"
          name="displayOrder"
          type="number"
          defaultValue={form.displayOrder}
          onChange={(e) => set('displayOrder', e.target.value)}
        />

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
            onClick={() => router.push('/dashboard/content/testimonials')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function TestimonialEditorPage() {
  return (
    <RequirePermission
      permissions={['content.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to edit content.
        </p>
      }
    >
      <TestimonialEditor />
    </RequirePermission>
  );
}
