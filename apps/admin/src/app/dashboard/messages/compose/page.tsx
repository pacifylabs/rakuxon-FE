'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, useToast } from '@rakuxon/ui';
import type { AdminStudentSummary, ComposeMessageRequest, Tenant } from '@rakuxon/contract';

import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError || caught instanceof NetworkError ? caught.message : fallback;
}

type Scope = ComposeMessageRequest['scope'];
type Status = NonNullable<ComposeMessageRequest['status']>;

const SCOPES: { value: Scope; label: string; description: string }[] = [
  { value: 'student', label: 'One student', description: 'A single applicant, by name.' },
  { value: 'tenant', label: 'A partner\'s students', description: 'Every student under one partner.' },
  { value: 'status', label: 'By application status', description: 'Every student with an application in a given status.' },
  { value: 'all', label: 'Everyone', description: 'Every student in the system.' },
];

function ComposeForm() {
  const router = useRouter();
  const client = useAdminApiClient();
  const toast = useToast();

  const [scope, setScope] = useState<Scope>('student');
  const [studentId, setStudentId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [status, setStatus] = useState<Status>('submitted');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<AdminStudentSummary[] | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);

  useEffect(() => {
    if (scope === 'student' && !students) {
      client
        .listAdminStudents({ limit: 100 })
        .then((result) => setStudents(result.items))
        .catch(() => setStudents([]));
    }
    if (scope === 'tenant' && !tenants) {
      client
        .listTenants({ limit: 100 })
        .then((result) => setTenants(result.items))
        .catch(() => setTenants([]));
    }
  }, [scope, students, tenants, client]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const dto: ComposeMessageRequest = {
      scope,
      body,
      studentId: scope === 'student' ? studentId : undefined,
      tenantId: scope === 'tenant' ? tenantId : undefined,
      status: scope === 'status' ? status : undefined,
    };

    setSending(true);
    try {
      const result = await client.composeMessage(dto);
      toast.success(
        result.recipientCount === 1
          ? 'Message sent to 1 student.'
          : `Message sent to ${result.recipientCount} students.`,
      );
      router.push('/dashboard/messages');
    } catch (caught) {
      const message = errorMessage(caught, 'Could not send this message. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="compose-heading">
      <h1 id="compose-heading" className="font-heading text-3xl font-bold text-text">
        New message
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Sent once, immediately, to whoever this scope resolves to right now — each as their own
        private conversation with you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-text">Send to</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCOPES.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-1 rounded-md border p-4 text-sm ${
                  scope === option.value ? 'border-primary bg-accent-soft' : 'border-border bg-surface'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold text-text">
                  <input
                    type="radio"
                    name="scope"
                    value={option.value}
                    checked={scope === option.value}
                    onChange={() => setScope(option.value)}
                  />
                  {option.label}
                </span>
                <span className="text-text-muted">{option.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {scope === 'student' && (
          <label className="flex flex-col gap-1 text-sm text-text">
            Student
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
              className="rounded-md border border-border bg-surface px-4 py-2 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              <option value="" disabled>
                {students ? 'Choose a student' : 'Loading…'}
              </option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} — {student.email}
                </option>
              ))}
            </select>
          </label>
        )}

        {scope === 'tenant' && (
          <label className="flex flex-col gap-1 text-sm text-text">
            Partner
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              required
              className="rounded-md border border-border bg-surface px-4 py-2 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              <option value="" disabled>
                {tenants ? 'Choose a partner' : 'Loading…'}
              </option>
              {tenants?.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {scope === 'status' && (
          <label className="flex flex-col gap-1 text-sm text-text">
            Application status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>
          </label>
        )}

        <label className="flex flex-col gap-2 text-sm text-text">
          Message
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={6}
            required
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/dashboard/messages')}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function ComposeMessagePage() {
  return (
    <RequirePermission
      permissions={['messaging.manage']}
      denied={
        <p className="text-base text-text-muted">
          Your account does not have permission to compose messages.
        </p>
      }
    >
      <ComposeForm />
    </RequirePermission>
  );
}
