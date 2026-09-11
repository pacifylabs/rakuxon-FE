'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type { AdminArticleDetail } from '@rakuxon/contract';

import { StringArrayEditor } from '@/components/dashboard/editors/StringArrayEditor';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  heroImageUrl: string;
  countryCode: string;
  tags: string[];
  readMinutes: string;
  author: string;
  publishedAt: string;
}

const BLANK: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  heroImageUrl: '',
  countryCode: '',
  tags: [],
  readMinutes: '',
  author: '',
  publishedAt: '',
};

function fromDetail(detail: AdminArticleDetail): FormState {
  return {
    slug: detail.slug,
    title: detail.title,
    excerpt: detail.excerpt ?? '',
    body: detail.body,
    heroImageUrl: detail.heroImageUrl ?? '',
    countryCode: detail.countryCode ?? '',
    tags: detail.tags,
    readMinutes: detail.readMinutes?.toString() ?? '',
    author: detail.author ?? '',
    // <input type="date"> wants YYYY-MM-DD, not a full ISO timestamp.
    publishedAt: detail.publishedAt?.slice(0, 10) ?? '',
  };
}

function ArticleEditor() {
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
      setForm(fromDetail(await client.getArticleDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this article. Please try again.',
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
        const created = await client.createArticle({
          slug: form.slug,
          title: form.title,
          body: form.body,
          excerpt: form.excerpt || undefined,
          heroImageUrl: form.heroImageUrl || undefined,
          countryCode: form.countryCode || undefined,
          tags: form.tags.filter((tag) => tag.trim()),
          readMinutes: form.readMinutes ? Number(form.readMinutes) : undefined,
          author: form.author || undefined,
          publishedAt: form.publishedAt || undefined,
        });
        router.push(`/dashboard/catalogue/articles/${created.id}`);
      } else {
        await client.updateArticle(params.id, {
          slug: form.slug,
          title: form.title,
          body: form.body,
          excerpt: form.excerpt || null,
          heroImageUrl: form.heroImageUrl || null,
          countryCode: form.countryCode || null,
          tags: form.tags.filter((tag) => tag.trim()),
          readMinutes: form.readMinutes ? Number(form.readMinutes) : null,
          author: form.author || null,
          publishedAt: form.publishedAt || null,
        });
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this article. Please try again.',
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
    <section aria-labelledby="article-editor-heading">
      <h1 id="article-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New article' : 'Edit article'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the articles list — this screen is the
        record's own fields only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Title" name="title" defaultValue={form.title} onChange={(e) => set('title', e.target.value)} required />
          <FormField label="Slug" name="slug" defaultValue={form.slug} onChange={(e) => set('slug', e.target.value)} required />
        </div>

        <FormField label="Excerpt" name="excerpt" defaultValue={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />

        <div className="flex flex-col gap-2">
          <label htmlFor="body" className="text-sm font-medium text-text">
            Body (Markdown)
          </label>
          <textarea
            id="body"
            value={form.body}
            onChange={(event) => set('body', event.target.value)}
            rows={12}
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Hero image URL" name="heroImageUrl" defaultValue={form.heroImageUrl} onChange={(e) => set('heroImageUrl', e.target.value)} />
          <FormField label="Country code" name="countryCode" placeholder="GB" defaultValue={form.countryCode} onChange={(e) => set('countryCode', e.target.value.toUpperCase())} />
          <FormField label="Read minutes" name="readMinutes" type="number" defaultValue={form.readMinutes} onChange={(e) => set('readMinutes', e.target.value)} />
          <FormField label="Author" name="author" defaultValue={form.author} onChange={(e) => set('author', e.target.value)} />
          <FormField label="Published date" name="publishedAt" type="date" defaultValue={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
        </div>

        <StringArrayEditor label="Tags" values={form.tags} onChange={(tags) => set('tags', tags)} placeholder="visa" />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/dashboard/catalogue/articles')}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function ArticleEditorPage() {
  return (
    <RequirePermission
      permissions={['catalogue.publish']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to edit the catalogue.</p>}
    >
      <ArticleEditor />
    </RequirePermission>
  );
}
