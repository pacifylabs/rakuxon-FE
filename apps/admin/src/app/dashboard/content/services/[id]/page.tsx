'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, useToast } from '@rakuxon/ui';
import type { AdminServiceDetail, ServiceFaq } from '@rakuxon/contract';

import { FaqsEditor } from '@/components/dashboard/editors/FaqsEditor';
import { StringArrayEditor } from '@/components/dashboard/editors/StringArrayEditor';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

type Strand = 'education' | 'travel';
const STRANDS: { value: Strand; label: string }[] = [
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
];

/** The fixed lucide icon set the public site's `resolveServiceIcon` resolves from. */
const ICON_NAMES = [
  'Compass',
  'GraduationCap',
  'Stamp',
  'PlaneTakeoff',
  'Headphones',
  'Send',
] as const;

interface FormState {
  slug: string;
  iconName: string;
  title: string;
  summary: string;
  description: string;
  strand: Strand;
  metaTitle: string;
  metaDescription: string;
  whatsIncluded: string[];
  faqs: ServiceFaq[];
  relatedArticleSlugs: string;
  displayOrder: string;
}

const BLANK: FormState = {
  slug: '',
  iconName: ICON_NAMES[0],
  title: '',
  summary: '',
  description: '',
  strand: 'education',
  metaTitle: '',
  metaDescription: '',
  whatsIncluded: [],
  faqs: [],
  relatedArticleSlugs: '',
  displayOrder: '0',
};

function fromDetail(detail: AdminServiceDetail): FormState {
  return {
    slug: detail.slug,
    iconName: detail.iconName,
    title: detail.title,
    summary: detail.summary,
    description: detail.description,
    strand: detail.strand,
    metaTitle: detail.metaTitle,
    metaDescription: detail.metaDescription,
    whatsIncluded: detail.whatsIncluded,
    faqs: detail.faqs,
    relatedArticleSlugs: (detail.relatedArticleSlugs ?? []).join(', '),
    displayOrder: String(detail.displayOrder),
  };
}

function parseRelatedArticleSlugs(value: string): string[] | null {
  const slugs = value
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);
  return slugs.length > 0 ? slugs : null;
}

function ServiceEditor() {
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
      setForm(fromDetail(await client.getServiceDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this service. Please try again.',
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

    const payload = {
      slug: form.slug,
      iconName: form.iconName,
      title: form.title,
      summary: form.summary,
      description: form.description,
      strand: form.strand,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      whatsIncluded: form.whatsIncluded,
      faqs: form.faqs,
      relatedArticleSlugs: parseRelatedArticleSlugs(form.relatedArticleSlugs),
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      if (isNew) {
        const created = await client.createService(payload);
        toast.success('Service created.');
        router.push(`/dashboard/content/services/${created.id}`);
      } else {
        await client.updateService(params.id, payload);
        toast.success('Service saved.');
      }
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this service. Please try again.';
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
    <section aria-labelledby="service-editor-heading">
      <h1 id="service-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New service' : 'Edit service'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the services list — this screen is the
        record's own fields only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="Title"
            name="title"
            defaultValue={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
          <FormField
            label="Slug"
            name="slug"
            placeholder="e.g. free-consultancy"
            defaultValue={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            required
          />
        </div>

        <FormField
          label="Summary"
          name="summary"
          placeholder="One line, shown on the services list card"
          defaultValue={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          required
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-text">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={4}
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="strand" className="text-sm font-medium text-text">
              Strand
            </label>
            <select
              id="strand"
              value={form.strand}
              onChange={(event) => set('strand', event.target.value as Strand)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
            >
              {STRANDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="iconName" className="text-sm font-medium text-text">
              Icon
            </label>
            <select
              id="iconName"
              value={form.iconName}
              onChange={(event) => set('iconName', event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
            >
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label="Meta title"
            name="metaTitle"
            defaultValue={form.metaTitle}
            onChange={(e) => set('metaTitle', e.target.value)}
            required
          />
          <FormField
            label="Meta description"
            name="metaDescription"
            defaultValue={form.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
            required
          />
        </div>

        <StringArrayEditor
          label="What's included"
          values={form.whatsIncluded}
          onChange={(values) => set('whatsIncluded', values)}
          placeholder="A scannable bullet expanding on the description"
        />

        <FaqsEditor values={form.faqs} onChange={(values) => set('faqs', values)} />

        <FormField
          label="Related article slugs"
          name="relatedArticleSlugs"
          placeholder="Comma-separated, e.g. how-to-choose-a-university-abroad, uk-student-visa-order-of-events"
          defaultValue={form.relatedArticleSlugs}
          onChange={(e) => set('relatedArticleSlugs', e.target.value)}
        />

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
            onClick={() => router.push('/dashboard/content/services')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function ServiceEditorPage() {
  return (
    <RequirePermission
      permissions={['content.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to edit content.
        </p>
      }
    >
      <ServiceEditor />
    </RequirePermission>
  );
}
