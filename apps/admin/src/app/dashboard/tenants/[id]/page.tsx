'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, ConfirmDialog, FormField, useToast } from '@rakuxon/ui';
import type { Tenant, TenantStaff } from '@rakuxon/contract';

import { TenantStatusBadge } from '@/components/dashboard/TenantStatusBadge';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

/**
 * An admin bringing in a partner the client already has a relationship with
 * — no self-service signup, no approval wait. Creates the partner active
 * immediately, plus its first staff user with a real password set directly.
 */
function NewTenantForm() {
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    try {
      const created = await client.createTenant({
        name: String(data.get('name') ?? '').trim(),
        slug: String(data.get('slug') ?? '').trim().toLowerCase(),
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      });
      toast.success('Partner created.');
      router.push(`/dashboard/tenants/${created.id}`);
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not create the partner. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="new-tenant-heading" className="max-w-xl">
      <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/tenants')}>
        ← Back to partners
      </Button>

      <h1 id="new-tenant-heading" className="mt-4 font-heading text-3xl font-bold text-text">
        New partner
      </h1>
      <p className="mt-2 text-base text-text-muted">
        For a partner the client already has a relationship with. Active immediately — no approval
        wait. Sets the first staff member's password directly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <FormField label="Partner name" name="name" placeholder="Northwind Education" required />
        <FormField
          label="Subdomain"
          name="slug"
          placeholder="northwind"
          hint="Lowercase letters, digits and hyphens."
          required
        />

        <fieldset className="grid gap-4">
          <legend className="mb-1 text-sm font-semibold text-text">First staff member</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="First name" name="firstName" autoComplete="given-name" required />
            <FormField label="Last name" name="lastName" autoComplete="family-name" required />
          </div>
          <FormField label="Email address" name="email" type="email" autoComplete="email" required />
          <FormField
            label="Temporary password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div>
          <Button type="submit" variant="primary" size="lg" disabled={pending}>
            {pending ? 'Creating…' : 'Create partner'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function AddStaffForm({ tenantId, onAdded }: { tenantId: string; onAdded: (staff: TenantStaff) => void }) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    setError(null);
    try {
      const created = await client.addTenantStaff(tenantId, {
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        role: String(data.get('role') ?? 'agency_admin') as 'agency_admin' | 'counselor',
      });
      onAdded(created);
      toast.success('Staff member added.');
      form.reset();
      setOpen(false);
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not add this staff member. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        Add staff member
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex max-w-md flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" name="firstName" autoComplete="given-name" required />
        <FormField label="Last name" name="lastName" autoComplete="family-name" required />
      </div>
      <FormField label="Email address" name="email" type="email" autoComplete="email" required />
      <FormField label="Temporary password" name="password" type="password" autoComplete="new-password" required />
      <label className="flex flex-col gap-2 text-sm font-medium text-text">
        Role
        <select
          name="role"
          defaultValue="agency_admin"
          className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring"
        >
          <option value="agency_admin">Admin</option>
          <option value="counselor">Counselor</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Adding…' : 'Add'}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StaffRow({ staff, tenantId }: { staff: TenantStaff; tenantId: string }) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [settingPassword, setSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSetPassword() {
    if (!newPassword.trim()) return;
    setPending(true);
    try {
      await client.setTenantStaffPassword(tenantId, staff.id, { password: newPassword.trim() });
      toast.success("Staff member's password updated.");
      setSettingPassword(false);
      setNewPassword('');
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not set this password. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div>
        <p className="font-heading text-sm font-semibold text-text">
          {staff.firstName} {staff.lastName}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {staff.email} · {staff.role === 'agency_admin' ? 'Admin' : 'Counselor'}
        </p>
      </div>
      <Button variant="ghost" size="md" onClick={() => setSettingPassword(true)}>
        Set new password
      </Button>

      <ConfirmDialog
        open={settingPassword}
        onOpenChange={(open) => {
          setSettingPassword(open);
          if (!open) setNewPassword('');
        }}
        title={`Set a new password for ${staff.firstName} ${staff.lastName}?`}
        description="They will need to sign in with this password. Share it with them directly."
        confirmLabel="Set password"
        confirming={pending}
        confirmDisabled={!newPassword.trim()}
        onConfirm={handleSetPassword}
      >
        <FormField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </ConfirmDialog>
    </li>
  );
}

function TenantDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();
  const toast = useToast();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<TenantStaff[] | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTenant(await client.getTenant(params.id));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this partner. Please try again.',
      );
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadStaff = useCallback(async () => {
    try {
      const result = await client.listTenantStaff(params.id);
      setStaff(result.items);
      setStaffError(null);
    } catch (caught) {
      setStaffError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : "Could not load this partner's staff. Please try again.",
      );
    }
  }, [client, params.id]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  function startEditing() {
    if (!tenant) return;
    setName(tenant.name);
    setSaveError(null);
    setEditing(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await client.updateTenant(params.id, { name });
      setTenant(updated);
      setEditing(false);
      toast.success('Partner updated.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save these changes. Please try again.';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <section>
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
        <Button variant="ghost" size="md" className="mt-4" onClick={() => router.push('/dashboard/tenants')}>
          Back to partners
        </Button>
      </section>
    );
  }

  if (!tenant) {
    return (
      <p role="status" className="text-base text-text-muted">
        Loading…
      </p>
    );
  }

  return (
    <section aria-labelledby="tenant-heading">
      <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/tenants')}>
        ← Back to partners
      </Button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="tenant-heading" className="font-heading text-3xl font-bold text-text">
            {tenant.name}
          </h1>
          <TenantStatusBadge status={tenant.status} />
        </div>
        {hasPermission('tenants.approve') && !editing && (
          <Button variant="ghost" size="md" onClick={startEditing}>
            Edit
          </Button>
        )}
      </div>
      <p className="mt-2 text-base text-text-muted">{tenant.slug}</p>

      {editing && (
        <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4">
          <FormField label="Partner name" name="name" defaultValue={name} onChange={(e) => setName(e.target.value)} required />
          {saveError && (
            <p role="alert" className="text-sm text-danger">
              {saveError}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">Staff</h2>
        <p className="mt-1 text-sm text-text-muted">
          Everyone who can sign in as this partner. Set a password directly for someone who has
          lost access to theirs.
        </p>

        {staffError && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {staffError}
          </p>
        )}

        {!staff && !staffError && (
          <p role="status" className="mt-4 text-sm text-text-muted">
            Loading…
          </p>
        )}

        {staff && staff.length > 0 && (
          <ul className="mt-4 rounded-lg border border-border bg-surface px-5">
            {staff.map((member) => (
              <StaffRow key={member.id} staff={member} tenantId={tenant.id} />
            ))}
          </ul>
        )}

        {hasPermission('tenants.approve') && (
          <div className="mt-4">
            <AddStaffForm
              tenantId={tenant.id}
              onAdded={(created) => setStaff((current) => [...(current ?? []), created])}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();

  if (params.id === 'new') {
    return (
      <RequirePermission
        permissions={['tenants.approve']}
        denied={<p className="text-base text-text-muted">Your account does not have permission to create partners.</p>}
      >
        <NewTenantForm />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission
      permissions={['tenants.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view partners.</p>}
    >
      <TenantDetail />
    </RequirePermission>
  );
}
