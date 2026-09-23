'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { GuardedPage, useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, ConfirmDialog, FormField, StatusBadge, useToast } from '@rakuxon/ui';
import type { TenantStaff } from '@rakuxon/contract';

/**
 * Invite a counselor, suspend or reactivate one — no way to add a second
 * agency_admin here (see `CreateAgencyStaffDto`'s own doc comment on the
 * backend: self-service can only ever create a counselor).
 */
function AddStaffForm({ onAdded }: { onAdded: (staff: TenantStaff) => void }) {
  const { apiClient } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    try {
      const created = await apiClient.addAgencyStaff({
        email: String(data.get('email') ?? '').trim(),
        firstName: String(data.get('firstName') ?? '').trim(),
        lastName: String(data.get('lastName') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      });
      toast.success('Counselor invited.');
      onAdded(created);
      form.reset();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not invite this counselor. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" name="firstName" autoComplete="given-name" required />
        <FormField label="Last name" name="lastName" autoComplete="family-name" required />
      </div>
      <FormField label="Email address" name="email" type="email" autoComplete="email" required />
      <FormField
        label="Temporary password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="They can change it via the reset flow afterwards."
        required
      />
      <div>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? 'Inviting…' : 'Invite counselor'}
        </Button>
      </div>
    </form>
  );
}

function StaffRow({
  member,
  onChanged,
}: {
  member: TenantStaff;
  onChanged: (updated: TenantStaff) => void;
}) {
  const { apiClient } = useAuth();
  const toast = useToast();
  const [confirming, setConfirming] = useState<'suspend' | 'reactivate' | null>(null);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    if (!confirming) return;
    setPending(true);
    try {
      const updated =
        confirming === 'suspend'
          ? await apiClient.suspendAgencyStaff(member.id)
          : await apiClient.reactivateAgencyStaff(member.id);
      onChanged(updated);
      toast.success(confirming === 'suspend' ? 'Suspended.' : 'Reactivated.');
      setConfirming(null);
    } catch (caught) {
      toast.error(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not update this staff member. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-heading text-sm font-semibold text-text">
          {member.firstName} {member.lastName}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {member.email} · {member.role === 'agency_admin' ? 'Admin' : 'Counselor'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge tone={member.status === 'active' ? 'positive' : 'neutral'}>
          {member.status}
        </StatusBadge>
        {member.role !== 'agency_admin' &&
          (member.status === 'active' ? (
            <Button variant="ghost" size="md" onClick={() => setConfirming('suspend')}>
              Suspend
            </Button>
          ) : (
            <Button variant="ghost" size="md" onClick={() => setConfirming('reactivate')}>
              Reactivate
            </Button>
          ))}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={
          confirming === 'suspend'
            ? `Suspend ${member.firstName} ${member.lastName}?`
            : `Reactivate ${member.firstName} ${member.lastName}?`
        }
        tone={confirming === 'suspend' ? 'danger' : 'default'}
        confirmLabel={confirming === 'suspend' ? 'Suspend' : 'Reactivate'}
        confirming={pending}
        onConfirm={handleConfirm}
      />
    </li>
  );
}

function StaffList() {
  const { apiClient } = useAuth();
  const [staff, setStaff] = useState<TenantStaff[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await apiClient.listAgencyStaff();
      setStaff(result.items);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load your staff. Please try again.',
      );
    }
  }, [apiClient]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleChanged(updated: TenantStaff) {
    setStaff((current) =>
      (current ?? []).map((member) => (member.id === updated.id ? updated : member)),
    );
  }

  return (
    <section aria-labelledby="staff-heading">
      <h1 id="staff-heading" className="font-heading text-3xl font-bold text-text">
        Staff
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Everyone at your agency with access to this workspace.
      </p>

      {error && (
        <p role="alert" className="mt-6 text-sm text-danger">
          {error}
        </p>
      )}

      {!staff && !error && (
        <p role="status" className="mt-6 text-sm text-text-muted">
          Loading…
        </p>
      )}

      {staff && staff.length > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
          {staff.map((member) => (
            <StaffRow key={member.id} member={member} onChanged={handleChanged} />
          ))}
        </ul>
      )}

      <div className="mt-12">
        <h2 className="font-heading text-xl font-semibold text-text">Invite a counselor</h2>
        <AddStaffForm onAdded={(created) => setStaff((current) => [...(current ?? []), created])} />
      </div>
    </section>
  );
}

export default function StaffPage() {
  const router = useRouter();

  return (
    <GuardedPage
      roles={['agency_admin']}
      onUnauthenticated={() => router.replace('/auth/login')}
      wrongRole={
        <p className="text-base text-text-muted">
          Staff management is limited to agency administrators.
        </p>
      }
    >
      <StaffList />
    </GuardedPage>
  );
}
