'use client';

import { UserPlus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, EmptyState, FormField } from '@rakuxon/ui';
import type { AdminSummary, Permission } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

function PermissionCheckboxes({
  permissions,
  selected,
  onToggle,
}: {
  permissions: Permission[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="sr-only">Permissions</legend>
      {permissions.map((permission) => (
        <label key={permission.key} className="flex items-start gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={selected.has(permission.key)}
            onChange={() => onToggle(permission.key)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">{permission.key}</span>
            <span className="block text-text-muted">{permission.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function EditPermissions({
  admin,
  permissions,
  onSaved,
  onCancel,
}: {
  admin: AdminSummary;
  permissions: Permission[];
  onSaved: (updated: AdminSummary) => void;
  onCancel: () => void;
}) {
  const client = useAdminApiClient();
  const [selected, setSelected] = useState(new Set(admin.permissions));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      onSaved(await client.updateAdminPermissions(admin.id, [...selected]));
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save permissions. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4">
      <PermissionCheckboxes
        permissions={permissions}
        selected={selected}
        onToggle={(key) =>
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          })
        }
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-3">
        <Button variant="primary" size="md" disabled={pending} onClick={save}>
          {pending ? 'Saving…' : 'Save permissions'}
        </Button>
        <Button variant="ghost" size="md" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CreateAdminForm({
  permissions,
  onCreated,
}: {
  permissions: Permission[];
  onCreated: (created: AdminSummary) => void;
}) {
  const client = useAdminApiClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    try {
      const created = await client.createAdmin({
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        permissionKeys: [...selected],
      });
      onCreated(created);
      setOpen(false);
      setSelected(new Set());
      event.currentTarget.reset();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not create the admin. Please try again.',
      );
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-6">
      <h2 className="font-heading text-lg font-semibold text-text">New admin</h2>
      <p className="mt-1 text-sm text-text-muted">
        Sets a real password directly — the new admin can change it via the reset flow afterwards.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="First name" name="firstName" autoComplete="given-name" />
        <FormField label="Last name" name="lastName" autoComplete="family-name" />
        <FormField label="Email address" name="email" type="email" autoComplete="email" />
        <FormField label="Temporary password" name="password" type="password" autoComplete="new-password" />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-text">Permissions</p>
        <PermissionCheckboxes
          permissions={permissions}
          selected={selected}
          onToggle={(key) =>
            setSelected((current) => {
              const next = new Set(current);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            })
          }
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Creating…' : 'Create admin'}
        </Button>
        <Button type="button" variant="ghost" size="md" disabled={pending} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AdminsList() {
  const client = useAdminApiClient();
  const [admins, setAdmins] = useState<AdminSummary[] | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [adminList, permissionList] = await Promise.all([
        client.listAdmins(),
        client.listAdminPermissions(),
      ]);
      setAdmins(adminList.items);
      setPermissions(permissionList);
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
      replace(admin.status === 'active' ? await client.suspendAdmin(admin.id) : await client.reactivateAdmin(admin.id));
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'That action could not be completed. Please try again.',
      );
    } finally {
      setPendingStatusId(null);
    }
  }

  return (
    <section aria-labelledby="admins-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="admins-heading" className="font-heading text-3xl font-bold text-text">
            Admins
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Every admin's permission set is independent — granting admins.manage lets an admin
            grant any key to anyone, including ones they do not hold themselves.
          </p>
        </div>
        {admins && <CreateAdminForm permissions={permissions} onCreated={(created) => setAdmins((c) => [...(c ?? []), created])} />}
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
        <ul className="mt-6 flex flex-col gap-3">
          {admins.map((admin) => (
            <li key={admin.id} className="rounded-lg border border-border bg-surface p-5">
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
                    onClick={() => toggleStatus(admin)}
                  >
                    {admin.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setEditingId(editingId === admin.id ? null : admin.id)}
                  >
                    {editingId === admin.id ? 'Close' : 'Edit permissions'}
                  </Button>
                </div>
              </div>

              <ul className="mt-3 flex flex-wrap gap-2">
                {admin.permissions.length === 0 && (
                  <li className="text-sm text-text-muted">No permissions granted.</li>
                )}
                {admin.permissions.map((key) => (
                  <li key={key} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted">
                    {key}
                  </li>
                ))}
              </ul>

              {editingId === admin.id && (
                <EditPermissions
                  admin={admin}
                  permissions={permissions}
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
    </section>
  );
}

export default function AdminsPage() {
  return (
    <RequirePermission
      permissions={['admins.manage']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to manage admins.</p>}
    >
      <AdminsList />
    </RequirePermission>
  );
}
