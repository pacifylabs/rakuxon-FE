'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField, StatusBadge } from '@rakuxon/ui';
import type { AdminStudentDetail, EducationHistoryEntry, StudentDocument, StudyLevel } from '@rakuxon/contract';

import { AdminDocumentRow } from '@/components/dashboard/AdminDocumentRow';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/components/dashboard/documentTypes';
import { RepeatableGroup } from '@/components/dashboard/editors/RepeatableGroup';
import { RequirePermission, useAdminApiClient, useAdminAuth } from '@/lib/admin-auth';

const STUDY_LEVELS: StudyLevel[] = ['foundation', 'undergraduate', 'postgraduate', 'research'];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-1 text-base text-text">{value || '—'}</dd>
    </div>
  );
}

interface FormState {
  dateOfBirth: string;
  nationality: string;
  phone: string;
  passportNumber: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  intendedStudyLevel: StudyLevel | '';
  intendedCountry: string;
  preferredIntake: string;
  educationHistory: EducationHistoryEntry[];
}

function fromDetail(student: AdminStudentDetail): FormState {
  return {
    dateOfBirth: student.dateOfBirth ?? '',
    nationality: student.nationality ?? '',
    phone: student.phone ?? '',
    passportNumber: student.passportNumber ?? '',
    line1: student.address.line1 ?? '',
    line2: student.address.line2 ?? '',
    city: student.address.city ?? '',
    region: student.address.region ?? '',
    postalCode: student.address.postalCode ?? '',
    countryCode: student.address.countryCode ?? '',
    intendedStudyLevel: student.intendedStudyLevel ?? '',
    intendedCountry: student.intendedCountry ?? '',
    preferredIntake: student.preferredIntake ?? '',
    educationHistory: student.educationHistory,
  };
}

/**
 * `students.view` sees this screen; `students.manage` can also switch it
 * into an edit form — a correction phoned in, or a document the student
 * cannot upload themselves. The two are separate permissions on the backend,
 * so the Edit control only renders for an admin actually holding the
 * stronger one.
 */
function StudentDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const client = useAdminApiClient();
  const { hasPermission } = useAdminAuth();

  const [student, setStudent] = useState<AdminStudentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[] | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const canReview = hasPermission('documents.review');

  const load = useCallback(async () => {
    try {
      setStudent(await client.getAdminStudent(params.id));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this student. Please try again.',
      );
    }
  }, [client, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDocuments = useCallback(async () => {
    if (!canReview) return;
    try {
      setDocuments(await client.listAdminStudentDocuments(params.id));
      setDocumentsError(null);
    } catch (caught) {
      setDocumentsError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this student’s documents. Please try again.',
      );
    }
  }, [client, params.id, canReview]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  function handleDocumentChanged(updated: StudentDocument) {
    setDocuments((current) => {
      const withoutPrevious = (current ?? []).filter((entry) => entry.id !== updated.id);
      return [updated, ...withoutPrevious];
    });
  }

  function startEditing() {
    if (!student) return;
    setForm(fromDetail(student));
    setSaveError(null);
    setEditing(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setSaveError(null);
    try {
      const updated = await client.updateAdminStudent(params.id, {
        dateOfBirth: form.dateOfBirth || undefined,
        nationality: form.nationality || undefined,
        phone: form.phone || undefined,
        passportNumber: form.passportNumber || undefined,
        address: {
          line1: form.line1 || undefined,
          line2: form.line2 || undefined,
          city: form.city || undefined,
          region: form.region || undefined,
          postalCode: form.postalCode || undefined,
          countryCode: form.countryCode || undefined,
        },
        educationHistory: form.educationHistory,
        intendedStudyLevel: form.intendedStudyLevel || undefined,
        intendedCountry: form.intendedCountry || undefined,
        preferredIntake: form.preferredIntake || undefined,
      });
      setStudent(updated);
      setEditing(false);
    } catch (caught) {
      setSaveError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save these changes. Please try again.',
      );
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
        <Button variant="ghost" size="md" className="mt-4" onClick={() => router.push('/dashboard/students')}>
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

  if (editing && form) {
    return (
      <section aria-labelledby="student-heading">
        <Button variant="ghost" size="md" onClick={() => setEditing(false)}>
          ← Cancel
        </Button>

        <h1 id="student-heading" className="mt-4 font-heading text-3xl font-bold text-text">
          Edit {student.fullName}
        </h1>
        <p className="mt-2 text-base text-text-muted">{student.email}</p>

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-2xl flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Date of birth" name="dateOfBirth" type="date" defaultValue={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            <FormField label="Nationality" name="nationality" placeholder="NG" defaultValue={form.nationality} onChange={(e) => set('nationality', e.target.value.toUpperCase())} />
            <FormField label="Phone" name="phone" defaultValue={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <FormField label="Passport number" name="passportNumber" defaultValue={form.passportNumber} onChange={(e) => set('passportNumber', e.target.value)} />
          </div>

          <fieldset className="grid gap-4">
            <legend className="mb-1 text-sm font-semibold text-text">Address</legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Line 1" name="line1" defaultValue={form.line1} onChange={(e) => set('line1', e.target.value)} />
              <FormField label="Line 2" name="line2" defaultValue={form.line2} onChange={(e) => set('line2', e.target.value)} />
              <FormField label="City" name="city" defaultValue={form.city} onChange={(e) => set('city', e.target.value)} />
              <FormField label="Region" name="region" defaultValue={form.region} onChange={(e) => set('region', e.target.value)} />
              <FormField label="Postal code" name="postalCode" defaultValue={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
              <FormField label="Country code" name="countryCode" placeholder="GB" defaultValue={form.countryCode} onChange={(e) => set('countryCode', e.target.value.toUpperCase())} />
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-text">
              Intended study level
              <select
                value={form.intendedStudyLevel}
                onChange={(e) => set('intendedStudyLevel', e.target.value as StudyLevel | '')}
                className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring"
              >
                <option value="">—</option>
                {STUDY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <FormField label="Intended country" name="intendedCountry" placeholder="GB" defaultValue={form.intendedCountry} onChange={(e) => set('intendedCountry', e.target.value.toUpperCase())} />
            <FormField label="Preferred intake" name="preferredIntake" placeholder="2026-09" defaultValue={form.preferredIntake} onChange={(e) => set('preferredIntake', e.target.value)} />
          </div>

          <RepeatableGroup<EducationHistoryEntry>
            label="Education history"
            items={form.educationHistory}
            onChange={(items) => set('educationHistory', items)}
            createBlank={() => ({ institutionName: '', qualification: '' })}
            renderRow={(item, update) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={item.institutionName}
                  onChange={(e) => update({ institutionName: e.target.value })}
                  placeholder="Institution name"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
                <input
                  value={item.qualification}
                  onChange={(e) => update({ qualification: e.target.value })}
                  placeholder="Qualification"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
                <input
                  value={item.fieldOfStudy ?? ''}
                  onChange={(e) => update({ fieldOfStudy: e.target.value || undefined })}
                  placeholder="Field of study"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
                <input
                  value={item.grade ?? ''}
                  onChange={(e) => update({ grade: e.target.value || undefined })}
                  placeholder="Grade"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
                <input
                  type="number"
                  value={item.startYear ?? ''}
                  onChange={(e) => update({ startYear: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Start year"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
                <input
                  type="number"
                  value={item.endYear ?? ''}
                  onChange={(e) => update({ endYear: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="End year"
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                />
              </div>
            )}
          />

          {saveError && (
            <p role="alert" className="text-sm text-danger">
              {saveError}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </section>
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
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={() => router.push('/dashboard/students')}>
          ← Back to students
        </Button>
        {hasPermission('students.manage') && (
          <Button variant="primary" size="md" onClick={startEditing}>
            Edit
          </Button>
        )}
      </div>

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
          <ul className="mt-4 flex flex-col gap-4">
            {student.educationHistory.map((entry, index) => (
              <li key={index} className="rounded-md border border-border bg-surface p-4">
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

      {canReview && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-text">Documents</h2>
          <p className="mt-1 text-sm text-text-muted">
            Reject an upload that doesn't hold up, or upload one on this student's behalf.
          </p>

          {documentsError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {documentsError}
            </p>
          )}

          {!documents && !documentsError && (
            <p role="status" className="mt-4 text-sm text-text-muted">
              Loading…
            </p>
          )}

          {documents && (
            <div className="mt-4 flex flex-col gap-3">
              {DOCUMENT_TYPES.map((type) => (
                <AdminDocumentRow
                  key={type}
                  studentId={student.id}
                  type={type}
                  label={DOCUMENT_TYPE_LABELS[type]}
                  document={documents.find((entry) => entry.type === type && entry.status !== 'deleted')}
                  canReview={canReview}
                  onChanged={handleDocumentChanged}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function StudentDetailPage() {
  return (
    <RequirePermission
      permissions={['students.view']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to view students.</p>}
    >
      <StudentDetail />
    </RequirePermission>
  );
}
