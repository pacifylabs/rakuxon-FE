'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, useToast } from '@rakuxon/ui';
import type { AdminDestinationDetail, DestinationFact } from '@rakuxon/contract';

import { ImageUploadField } from '@/components/dashboard/ImageUploadField';
import { RepeatableGroup } from '@/components/dashboard/editors/RepeatableGroup';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

interface FormState {
  slug: string;
  name: string;
  shortName: string;
  cardImageUrl: string;
  cardImageAlt: string;
  heroImageUrl: string;
  heroImageAlt: string;
  tagline: string;
  intro: string;
  whyHeading: string;
  why: string;
  whyPoints: string[];
  facts: DestinationFact[];
  universities: string[];
  helpPoints: string[];
  displayOrder: string;
}

const BLANK: FormState = {
  slug: '',
  name: '',
  shortName: '',
  cardImageUrl: '',
  cardImageAlt: '',
  heroImageUrl: '',
  heroImageAlt: '',
  tagline: '',
  intro: '',
  whyHeading: '',
  why: '',
  whyPoints: [],
  facts: [],
  universities: [],
  helpPoints: [],
  displayOrder: '0',
};

function fromDetail(detail: AdminDestinationDetail): FormState {
  return {
    slug: detail.slug,
    name: detail.name,
    shortName: detail.shortName,
    cardImageUrl: detail.cardImageUrl ?? '',
    cardImageAlt: detail.cardImageAlt,
    heroImageUrl: detail.heroImageUrl ?? '',
    heroImageAlt: detail.heroImageAlt,
    tagline: detail.tagline,
    intro: detail.intro,
    whyHeading: detail.whyHeading,
    why: detail.why,
    whyPoints: detail.whyPoints,
    facts: detail.facts,
    universities: detail.universities,
    helpPoints: detail.helpPoints,
    displayOrder: String(detail.displayOrder),
  };
}

function inputClasses() {
  return 'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring';
}

function DestinationEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();
  const isNew = params.id === 'new';

  const [form, setForm] = useState<FormState>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      setForm(fromDetail(await client.getDestinationDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this destination. Please try again.',
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        const created = await client.createDestination({
          slug: form.slug,
          name: form.name,
          shortName: form.shortName,
          tagline: form.tagline,
          intro: form.intro,
          whyHeading: form.whyHeading,
          why: form.why,
        });
        toast.success('Destination created.');
        router.push(`/dashboard/content/destinations/${created.id}`);
      } else {
        await client.updateDestination(params.id, {
          slug: form.slug,
          name: form.name,
          shortName: form.shortName,
          cardImageUrl: form.cardImageUrl || null,
          cardImageAlt: form.cardImageAlt,
          heroImageUrl: form.heroImageUrl || null,
          heroImageAlt: form.heroImageAlt,
          tagline: form.tagline,
          intro: form.intro,
          whyHeading: form.whyHeading,
          why: form.why,
          whyPoints: form.whyPoints,
          facts: form.facts,
          universities: form.universities,
          helpPoints: form.helpPoints,
          displayOrder: Number(form.displayOrder) || 0,
        });
        toast.success('Destination saved.');
      }
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this destination. Please try again.';
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

  return (
    <section aria-labelledby="destination-editor-heading">
      <h1 id="destination-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New destination' : 'Edit destination'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the destinations list — this screen is
        the guide's own fields only.
        {isNew && ' The rest of the fields open up once this is created.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="Slug"
            name="slug"
            hint="Used in the URL: /destinations/{slug}"
            defaultValue={form.slug}
            onChange={(e) => set('slug', e.target.value.toLowerCase())}
            required
          />
          <FormField
            label="Short name"
            name="shortName"
            placeholder="United Kingdom"
            defaultValue={form.shortName}
            onChange={(e) => set('shortName', e.target.value)}
            required
          />
        </div>
        <FormField
          label="Full name"
          name="name"
          placeholder="the United Kingdom"
          hint="Used in running text — include an article if the name needs one."
          defaultValue={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
        />
        <FormField
          label="Tagline"
          name="tagline"
          defaultValue={form.tagline}
          onChange={(e) => set('tagline', e.target.value)}
          required
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="intro" className="text-sm font-medium text-text">
            Intro
          </label>
          <textarea
            id="intro"
            value={form.intro}
            onChange={(event) => set('intro', event.target.value)}
            rows={3}
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          />
        </div>

        {!isNew && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploadField
                label="Card image"
                folder="destinations"
                value={form.cardImageUrl}
                onChange={(url) => set('cardImageUrl', url)}
              />
              <FormField
                label="Card image alt text"
                name="cardImageAlt"
                defaultValue={form.cardImageAlt}
                onChange={(e) => set('cardImageAlt', e.target.value)}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploadField
                label="Hero image"
                folder="destinations"
                value={form.heroImageUrl}
                onChange={(url) => set('heroImageUrl', url)}
              />
              <FormField
                label="Hero image alt text"
                name="heroImageAlt"
                defaultValue={form.heroImageAlt}
                onChange={(e) => set('heroImageAlt', e.target.value)}
              />
            </div>

            <FormField
              label="'Why' heading"
              name="whyHeading"
              placeholder="Why students choose the UK"
              defaultValue={form.whyHeading}
              onChange={(e) => set('whyHeading', e.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="why" className="text-sm font-medium text-text">
                Why
              </label>
              <textarea
                id="why"
                value={form.why}
                onChange={(event) => set('why', event.target.value)}
                rows={3}
                required
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>

            <RepeatableGroup<{ value: string }>
              label="Why points"
              items={form.whyPoints.map((value) => ({ value }))}
              onChange={(items) =>
                set(
                  'whyPoints',
                  items.map((item) => item.value),
                )
              }
              createBlank={() => ({ value: '' })}
              renderRow={(item, update) => (
                <input
                  value={item.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="A reason students choose this destination"
                  className={`w-full ${inputClasses()}`}
                />
              )}
            />

            <RepeatableGroup<DestinationFact>
              label="Facts"
              items={form.facts}
              onChange={(items) => set('facts', items)}
              createBlank={() => ({ label: '', value: '' })}
              renderRow={(item, update) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                    placeholder="Label, e.g. Main intake"
                    className={inputClasses()}
                  />
                  <input
                    value={item.value}
                    onChange={(e) => update({ value: e.target.value })}
                    placeholder="Value, e.g. September"
                    className={inputClasses()}
                  />
                  <input
                    value={item.hint ?? ''}
                    onChange={(e) => update({ hint: e.target.value || undefined })}
                    placeholder="Hint (optional)"
                    className={inputClasses()}
                  />
                </div>
              )}
            />

            <RepeatableGroup<{ value: string }>
              label="Universities"
              items={form.universities.map((value) => ({ value }))}
              onChange={(items) =>
                set(
                  'universities',
                  items.map((item) => item.value),
                )
              }
              createBlank={() => ({ value: '' })}
              renderRow={(item, update) => (
                <input
                  value={item.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="University name"
                  className={`w-full ${inputClasses()}`}
                />
              )}
            />

            <RepeatableGroup<{ value: string }>
              label="Help points"
              items={form.helpPoints.map((value) => ({ value }))}
              onChange={(items) =>
                set(
                  'helpPoints',
                  items.map((item) => item.value),
                )
              }
              createBlank={() => ({ value: '' })}
              renderRow={(item, update) => (
                <input
                  value={item.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="How Rakuxon helps with this destination"
                  className={`w-full ${inputClasses()}`}
                />
              )}
            />

            <FormField
              label="Display order"
              name="displayOrder"
              type="number"
              defaultValue={form.displayOrder}
              onChange={(e) => set('displayOrder', e.target.value)}
            />
          </>
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
            onClick={() => router.push('/dashboard/content/destinations')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function DestinationEditorPage() {
  return (
    <RequirePermission
      permissions={['content.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to edit content.
        </p>
      }
    >
      <DestinationEditor />
    </RequirePermission>
  );
}
