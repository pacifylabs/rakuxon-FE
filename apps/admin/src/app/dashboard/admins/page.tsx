'use client';

import { UserPlus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, ConfirmDialog, EmptyState, FormField, useToast } from '@rakuxon/ui';
import type { AdminSummary, AdminRoleSummary } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

function RoleSelect({
  roles,
  value,
  onChange,
}: {
  roles: AdminRoleSummary[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = roles.find((role) => role.id === value);
  return (
    <div>
      <label className="block text-sm font-semibold text-text">
        Role
        <select
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 block w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text"
        >
          <option value="">Choose a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </label>
      {roles.length === 0 && (
        <p className="mt-2 text-sm text-text-muted">
          Create a role in Roles &amp; permissions first.
        </p>
      )}
      {selected && (
        <p className="mt-2 text-sm text-text-muted">
          {selected.description} {selected.permissions.length} permissions inherited from this role.
        </p>
      )}
    </div>
  );
}

function EditRole({
  admin,
  roles,
  onSaved,
  onCancel,
}: {
  admin: AdminSummary;
  roles: AdminRoleSummary[];
  onSaved: (updated: AdminSummary) => void;
  onCancel: () => void;
}) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [roleId, setRoleId] = useState(admin.role?.id ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      onSaved(await client.assignAdminRole(admin.id, roleId));
      window.dispatchEvent(new Event('rakuxon:admin-access-changed'));
      toast.success('Role updated.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not assign this role. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-surface-muted p-4">
      <RoleSelect roles={roles} value={roleId} onChange={setRoleId} />
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-3">
        <Button variant="primary" size="md" disabled={pending || !roleId} onClick={save}>
          {pending ? 'Saving…' : 'Save role'}
        </Button>
        <Button variant="ghost" size="md" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CreateAdminForm({
  roles,
  onCreated,
}: {
  roles: AdminRoleSummary[];
  onCreated: (created: AdminSummary) => void;
}) {
  const client = useAdminApiClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    setError(null);
    try {
      const created = await client.createAdmin({
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        roleId,
      });
      onCreated(created);
      setOpen(false);
      setRoleId('');
      form.reset();
      toast.success('Admin created.');
    } catch (caught) {
      const message =
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not create the admin. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="primary" size="md" onClick={() => setOpen(true)}>
        <UserPlus aria-hidden="true" className="size-4" />
        New admin
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface p-6">
      <h2 className="font-heading text-lg font-semibold text-text">New admin</h2>
      <p className="mt-1 text-sm text-text-muted">
        Sets a real password directly — the new admin can change it via the reset flow afterwards.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="First name" name="firstName" autoComplete="given-name" />
        <FormField label="Last name" name="lastName" autoComplete="family-name" />
        <FormField label="Email address" name="email" type="email" autoComplete="email" />
        <FormField
          label="Temporary password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
      </div>

      <div className="mt-4">
        <RoleSelect roles={roles} value={roleId} onChange={setRoleId} />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending || !roleId}>
          {pending ? 'Creating…' : 'Create admin'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AdminsList() {
  const client = useAdminApiClient();
  const toast = useToast();
  const [admins, setAdmins] = useState<AdminSummary[] | null>(null);
  const [roles, setRoles] = useState<AdminRoleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminSummary | null>(null);

  const load = useCallback(async () => {
    try {
      const [adminList, roleList] = await Promise.all([
        client.listAdmins(),
        client.listAdminRoles(),
      ]);
      setAdmins(adminList.items);
      setRoles(roleList);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load admins. Please try again.',
      );
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  function replace(updated: AdminSummary) {
    setAdmins((current) => current?.map((row) => (row.id === updated.id ? updated : row)) ?? null);
  }

  async function toggleStatus(admin: AdminSummary) {
    setPendingStatusId(admin.id);
    try {
      const wasActive = admin.status === 'active';
      replace(wasActive ? await client.suspendAdmin(admin.id) : await client.reactivateAdmin(admin.id));
      toast.success(wasActive ? 'Admin suspended.' : 'Admin reactivated.');
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingStatusId(null);
    }
  }

  async function confirmToggleStatus() {
    if (!statusTarget) return;
    await toggleStatus(statusTarget);
    setStatusTarget(null);
  }

  return (
    <section aria-labelledby="admins-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="admins-heading" className="font-heading text-3xl font-bold text-text">
            Admins
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Assign one role to each admin. Manage shared permissions in Roles &amp; permissions.
          </p>
        </div>
        {admins && (
          <CreateAdminForm
            roles={roles}
            onCreated={(created) => setAdmins((c) => [...(c ?? []), created])}
          />
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-base text-danger">
          {error}
        </p>
      )}

      {!admins && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading…
        </p>
      )}

      {admins && admins.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={Users} title="No other admins yet" description="Create one above." />
        </div>
      )}

      {admins && admins.length > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
          {admins.map((admin) => (
            <li key={admin.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-base font-semibold text-text">
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{admin.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted">{admin.status}</span>
                  <Button
                    variant="ghost"
                    size="md"
                    disabled={pendingStatusId === admin.id}
                    onClick={() => setStatusTarget(admin)}
                  >
                    {admin.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setEditingId(editingId === admin.id ? null : admin.id)}
                  >
                    {editingId === admin.id ? 'Close' : 'Change role'}
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-text">
                Role: {admin.role?.name ?? 'Legacy permissions — assign a role'}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {admin.permissions.length === 0 && (
                  <li className="text-sm text-text-muted">No permissions granted.</li>
                )}
                {admin.permissions.map((key) => (
                  <li
                    key={key}
                    className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted"
                  >
                    {key}
                  </li>
                ))}
              </ul>

              {editingId === admin.id && (
                <EditRole
                  admin={admin}
                  roles={roles}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    replace(updated);
                    setEditingId(null);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={statusTarget !== null}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={
          statusTarget?.status === 'active'
            ? `Suspend ${statusTarget.firstName} ${statusTarget.lastName}?`
            : `Reactivate ${statusTarget?.firstName} ${statusTarget?.lastName}?`
        }
        description={
          statusTarget?.status === 'active'
            ? 'They will lose access to the admin immediately.'
            : 'They will regain access to the admin immediately.'
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Suspend' : 'Reactivate'}
        tone={statusTarget?.status === 'active' ? 'danger' : 'default'}
        confirming={pendingStatusId === statusTarget?.id}
        onConfirm={confirmToggleStatus}
      />
    </section>
  );
}

export default function AdminsPage() {
  return (
    <RequirePermission
      permissions={['admins.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to manage admins.
        </p>
      }
    >
      <AdminsList />
    </RequirePermission>
  );
}
