'use client';

import { FolderOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FormField,
  Pagination,
  SelectField,
  StatusBadge,
  useToast,
} from '@rakuxon/ui';
import type { DataTableColumn, SelectFieldOption } from '@rakuxon/ui';
import type { MediaAsset, MediaAssetCategory } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const CATEGORY_LABELS: Record<MediaAssetCategory, string> = {
  social_toolkit: 'Social toolkit',
  brand_asset: 'Brand asset',
  design: 'Design',
  other: 'Other',
};

const CATEGORY_OPTIONS: SelectFieldOption[] = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

const CATEGORY_FILTERS: Array<{ value: MediaAssetCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  ...CATEGORY_OPTIONS.map((option) => ({
    value: option.value as MediaAssetCategory,
    label: option.label,
  })),
];

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function UploadForm({ onUploaded }: { onUploaded: (asset: MediaAsset) => void }) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [category, setCategory] = useState<MediaAssetCategory>('other');
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();

    setPending(true);
    setError(null);
    try {
      const signature = await client.getContentUploadSignature({ folder: 'media-assets' });

      const uploadData = new FormData();
      uploadData.set('file', file);
      uploadData.set('api_key', signature.apiKey);
      uploadData.set('timestamp', String(signature.timestamp));
      uploadData.set('signature', signature.signature);
      uploadData.set('public_id', signature.publicId);

      const uploadResponse = await fetch(signature.uploadUrl, { method: 'POST', body: uploadData });
      const uploadBody = (await uploadResponse.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadBody.secure_url) {
        throw new Error(uploadBody.error?.message ?? 'The upload did not complete.');
      }

      const asset = await client.createMediaAsset({
        title,
        description: description || undefined,
        category,
        fileUrl: uploadBody.secure_url,
        cloudinaryPublicId: signature.publicId,
        mimeType: file.type || undefined,
        bytes: file.size,
      });

      onUploaded(asset);
      form.reset();
      setFile(null);
      setCategory('other');
      toast.success('Added to the media library.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Could not upload that file. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:max-w-xl">
      <FormField label="Title" name="title" required />
      <FormField label="Description" name="description" hint="Optional." />
      <SelectField
        label="Category"
        name="category"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={(value) => setCategory(value as MediaAssetCategory)}
        required
      />
      <label className="flex flex-col gap-2 text-sm font-medium text-text">
        File
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-text file:mr-4 file:rounded-sm file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </form>
  );
}

function EditDialog({
  asset,
  onOpenChange,
  onSaved,
}: {
  asset: MediaAsset | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (asset: MediaAsset) => void;
}) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MediaAssetCategory>('other');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setTitle(asset.title);
    setDescription(asset.description ?? '');
    setCategory(asset.category);
  }, [asset]);

  async function handleSave() {
    if (!asset) return;
    setPending(true);
    try {
      const updated = await client.updateMediaAsset(asset.id, { title, description, category });
      onSaved(updated);
      toast.success('Saved.');
      onOpenChange(false);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save these changes. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <ConfirmDialog
      open={asset !== null}
      onOpenChange={onOpenChange}
      title="Edit asset"
      confirmLabel="Save"
      confirming={pending}
      confirmDisabled={!title.trim()}
      onConfirm={handleSave}
    >
      <div className="flex flex-col gap-4">
        <FormField
          label="Title"
          name="title"
          defaultValue={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <FormField
          label="Description"
          name="description"
          defaultValue={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <SelectField
          label="Category"
          name="category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => setCategory(value as MediaAssetCategory)}
        />
      </div>
    </ConfirmDialog>
  );
}

function MediaLibraryList() {
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const toast = useToast();
  const canManage = hasPermission('media.manage');

  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageCount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<MediaAssetCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await client.listMediaAssets({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        q: q.trim() || undefined,
        page,
      });
      setItems(result.items);
      setPageInfo({ page: result.page, pageCount: result.pageCount });
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load the media library. Please try again.',
      );
    }
  }, [client, categoryFilter, q, page]);

  useEffect(() => {
    setItems(null);
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, q]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await client.deleteMediaAsset(deleting.id);
      setItems((current) => (current ?? []).filter((entry) => entry.id !== deleting.id));
      toast.success('Removed.');
      setDeleting(null);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not remove that file. Please try again.',
      );
    } finally {
      setDeletePending(false);
    }
  }

  const columns: DataTableColumn<MediaAsset>[] = [
    {
      header: 'File',
      cell: (row) => (
        <div>
          <p className="font-heading text-sm font-semibold text-text">{row.title}</p>
          {row.description && <p className="mt-1 text-sm text-text-muted">{row.description}</p>}
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => <StatusBadge tone="neutral">{CATEGORY_LABELS[row.category]}</StatusBadge>,
    },
    {
      header: 'Uploaded by',
      cell: (row) => <span className="text-text-muted">{row.uploadedByAdminName ?? '—'}</span>,
    },
    {
      header: 'Size',
      cell: (row) => <span className="text-text-muted">{formatBytes(row.bytes)}</span>,
    },
    {
      header: 'Added',
      cell: (row) => (
        <span className="whitespace-nowrap text-text-muted">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          >
            View
          </a>
          {canManage && (
            <>
              <Button variant="ghost" size="md" onClick={() => setEditing(row)}>
                Edit
              </Button>
              <Button variant="ghost" size="md" onClick={() => setDeleting(row)}>
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="media-heading">
      <h1 id="media-heading" className="font-heading text-3xl font-bold text-text">
        Media library
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Social toolkits, brand assets, designs and everything else worth keeping in one place.
      </p>

      {canManage && (
        <UploadForm onUploaded={(asset) => setItems((current) => [asset, ...(current ?? [])])} />
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCategoryFilter(filter.value)}
              aria-pressed={categoryFilter === filter.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                categoryFilter === filter.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-muted text-text-muted hover:bg-accent-soft'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="ml-auto flex items-center gap-2 text-sm text-text-muted">
          <span className="sr-only">Search by title or description</span>
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search…"
            className="w-64 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!items && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {items && (
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={FolderOpen}
                title="Nothing here yet"
                description="Upload a file above to start the library."
              />
            }
          />
          <Pagination page={pageInfo.page} pageCount={pageInfo.pageCount} onPageChange={setPage} />
        </div>
      )}

      <EditDialog
        asset={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={(updated) =>
          setItems((current) =>
            (current ?? []).map((entry) => (entry.id === updated.id ? updated : entry)),
          )
        }
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove "${deleting?.title}"?`}
        description="This deletes the file from the library. It cannot be undone."
        confirmLabel="Remove"
        tone="danger"
        confirming={deletePending}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

export default function MediaLibraryPage() {
  return (
    <RequirePermission
      permissions={['media.view']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to view the media library.
        </p>
      }
    >
      <MediaLibraryList />
    </RequirePermission>
  );
}
