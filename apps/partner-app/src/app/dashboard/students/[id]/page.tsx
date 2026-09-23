'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@rakuxon/auth';
import { ApiError, NetworkError } from '@rakuxon/api-client';
import { ApplicationStatusBadge, Button, StatusBadge } from '@rakuxon/ui';
import type { AdminApplicationSummary, AdminStudentDetail } from '@rakuxon/contract';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-1 text-base text-text">{value || '—'}</dd>
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { apiClient } = useAuth();

  const [student, setStudent] = useState<AdminStudentDetail | null>(null);
  const [applications, setApplications] = useState<AdminApplicationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [detail, applicationList] = await Promise.all([
        apiClient.getAgencyStudent(params.id),
        apiClient.listAgencyApplications({ studentId: params.id, limit: 100 }),
      ]);
      setStudent(detail);
      setApplications(applicationList.items);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this student. Please try again.',
      );
    }
  }, [apiClient, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <section>
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
        <Button
          variant="ghost"
          size="md"
          className="mt-4"
          onClick={() => router.push('/dashboard/students')}
        >
          Back to students
        </Button>
      </section>
    );
  }

  if (!student) {
    return (
      <p role="status" className="text-base text-text-muted">
        Loading…
      </p>
    );
  }

  const address = [
    student.address.line1,
    student.address.line2,
    student.address.city,
    student.address.region,
    student.address.postalCode,
    student.address.countryCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <section aria-labelledby="student-heading">
      <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/students')}>
        ← Back to students
      </Button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 id="student-heading" className="font-heading text-3xl font-bold text-text">
          {student.fullName}
        </h1>
        {student.profileCompletedAt ? (
          <StatusBadge tone="positive">Profile complete</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">Profile in progress</StatusBadge>
        )}
      </div>
      <p className="mt-2 text-base text-text-muted">{student.email}</p>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <dl className="grid gap-6">
          <Field label="Date of birth" value={student.dateOfBirth ?? ''} />
          <Field label="Nationality" value={student.nationality ?? ''} />
          <Field label="Phone" value={student.phone ?? ''} />
          <Field label="Passport number" value={student.passportNumber ?? ''} />
          <Field label="Address" value={address} />
        </dl>

        <dl className="grid gap-6">
          <Field label="Intended study level" value={student.intendedStudyLevel ?? ''} />
          <Field label="Intended country" value={student.intendedCountry ?? ''} />
          <Field label="Preferred intake" value={student.preferredIntake ?? ''} />
        </dl>
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">Education history</h2>
        {student.educationHistory.length === 0 ? (
          <p className="mt-2 text-base text-text-muted">Nothing entered yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
            {student.educationHistory.map((entry, index) => (
              <li key={index} className="p-4">
                <p className="font-semibold text-text">{entry.qualification}</p>
                <p className="text-sm text-text-muted">
                  {entry.institutionName}
                  {entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ''}
                </p>
                {(entry.startYear || entry.endYear) && (
                  <p className="mt-1 text-sm text-text-muted">
                    {entry.startYear ?? '—'} – {entry.endYear ?? '—'}
                    {entry.grade ? ` · ${entry.grade}` : ''}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold text-text">Applications</h2>
        {!applications || applications.length === 0 ? (
          <p className="mt-2 text-base text-text-muted">No applications yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-heading text-sm font-semibold text-text">
                    {application.courseTitle}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{application.institutionName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ApplicationStatusBadge status={application.status} />
                  <a
                    href={`/dashboard/applications/${application.id}`}
                    className="rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
