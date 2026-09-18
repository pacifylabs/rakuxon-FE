'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import type { AdminRoleSummary, Permission } from '@rakuxon/contract';
import { Button, EmptyState, FormField } from '@rakuxon/ui';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

const errorMessage = (error: unknown) =>
  error instanceof ApiError || error instanceof NetworkError
    ? error.message
    : 'Could not save your changes. Please try again.';

function RoleForm({
  role,
  permissions,
  onSaved,
  onCancel,
}: {
  role?: AdminRoleSummary;
  permissions: Permission[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const client = useAdminApiClient();
  const [selected, setSelected] = useState(new Set(role?.permissions ?? []));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const group = permission.key.split('.')[0]!;
    groups.set(group, [...(groups.get(group) ?? []), permission]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const body = {
        name: String(data.get('name')).trim(),
        description: String(data.get('description')).trim(),
        permissionKeys: [...selected],
      };
      if (role) await client.updateAdminRole(role.id, body);
      else await client.createAdminRole(body);
      window.dispatchEvent(new Event('rakuxon:admin-access-changed'));
      onSaved();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-lg border border-border bg-surface p-6">
      <h2 className="font-heading text-xl font-semibold text-text">
        {role ? `Edit ${role.name}` : 'New role'}
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        {role
          ? `Changes apply immediately to all ${role.adminCount} admins assigned to this role.`
          : 'Choose permissions once, then assign this role to any number of admins.'}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Role name"
          name="name"
          required
          defaultValue={role?.name}
          placeholder="Customer Support"
        />
        <FormField label="Description" name="description" defaultValue={role?.description} />
      </div>
      <p className="mt-6 text-sm font-semibold text-text">{selected.size} permissions selected</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[...groups].map(([group, items]) => (
          <fieldset key={group} className="rounded-lg border border-border p-4">
            <legend className="px-2 text-base font-semibold capitalize text-text">
              {group.replaceAll('-', ' ')}
            </legend>
            <div className="flex flex-col gap-3">
              {items.map((permission) => (
                <label key={permission.key} className="flex items-start gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={selected.has(permission.key)}
                    onChange={() =>
                      setSelected((current) => {
                        const next = new Set(current);
                        if (next.has(permission.key)) next.delete(permission.key);
                        else next.add(permission.key);
                        return next;
                      })
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="font-semibold">{permission.key}</span>
                    <span className="block text-text-muted">{permission.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {selected.has('admins.manage') && (
        <p className="mt-4 text-sm text-text-muted">
          Admin management allows creating roles and granting any permission to any admin.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? 'Saving…' : 'Save role'}
        </Button>
        <Button type="button" variant="ghost" size="md" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function RolesList() {
  const client = useAdminApiClient();
  const [roles, setRoles] = useState<AdminRoleSummary[] | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editing, setEditing] = useState<AdminRoleSummary | 'new' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const [roles, permissions] = await Promise.all([
        client.listAdminRoles(),
        client.listAdminPermissions(),
      ]);
      setRoles(roles);
      setPermissions(permissions);
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, [client]);
  useEffect(() => {
    void load();
  }, [load]);
  async function remove(id: string) {
    setPending(true);
    setError(null);
    try {
      await client.deleteAdminRole(id);
      setDeleting(null);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setPending(false);
    }
  }
  return (
    <section aria-labelledby="roles-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="roles-heading" className="font-heading text-3xl font-bold text-text">
            Roles &amp; permissions
          </h1>
          <p className="mt-2 max-w-prose text-base text-text-muted">
            Create roles such as Customer Support or Catalogue Editor. Admins inherit the
            permissions of their assigned role.
          </p>
        </div>
        {roles && !editing && (
          <Button variant="primary" size="md" onClick={() => setEditing('new')}>
            New role
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-base text-danger">
          {error}
        </p>
      )}
      {!roles && !error && (
        <p role="status" className="mt-6 text-base text-text-muted">
          Loading roles…
        </p>
      )}
      {editing && (
        <RoleForm
          key={editing === 'new' ? 'new' : editing.id}
          role={editing === 'new' ? undefined : editing}
          permissions={permissions}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
      {roles?.length === 0 && !editing && (
        <div className="mt-6">
          <EmptyState
            icon={ShieldCheck}
            title="No roles yet"
            description="Create your first role, then assign it when adding admins."
          />
        </div>
      )}
      <ul className="mt-6 flex flex-col gap-3">
        {roles?.map((role) => (
          <li key={role.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-text">{role.name}</h2>
                <p className="mt-1 text-sm text-text-muted">{role.description}</p>
                <p className="mt-2 text-sm text-text-muted">
                  {role.adminCount} admins · {role.permissions.length} permissions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setEditing(role);
                    setDeleting(null);
                  }}
                >
                  Edit role
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={role.adminCount > 0 || pending}
                  onClick={() => setDeleting(role.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            {role.adminCount > 0 && (
              <p className="mt-2 text-sm text-text-muted">
                Reassign these admins before deleting this role.
              </p>
            )}
            {deleting === role.id && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-text">Delete {role.name}?</p>
                <Button
                  variant="primary"
                  size="md"
                  disabled={pending}
                  onClick={() => remove(role.id)}
                >
                  Confirm delete
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={pending}
                  onClick={() => setDeleting(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RolesPage() {
  return (
    <RequirePermission
      permissions={['admins.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to manage roles.
        </p>
      }
    >
      <RolesList />
    </RequirePermission>
  );
}
