'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type {
  AdminCourseDetail,
  EnglishTestShape,
  IntakeShape,
  RequirementGroupShape,
  ScholarshipShape,
  StudyLevel,
  StudyMode,
  TuitionPeriod,
} from '@rakuxon/contract';

import { EnglishTestsEditor } from '@/components/dashboard/editors/EnglishTestsEditor';
import { InstitutionPicker } from '@/components/dashboard/editors/InstitutionPicker';
import { IntakesEditor } from '@/components/dashboard/editors/IntakesEditor';
import { RequirementGroupsEditor } from '@/components/dashboard/editors/RequirementGroupsEditor';
import { ScholarshipsEditor } from '@/components/dashboard/editors/ScholarshipsEditor';
import { StringArrayEditor } from '@/components/dashboard/editors/StringArrayEditor';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

const LEVELS: StudyLevel[] = ['foundation', 'undergraduate', 'postgraduate', 'research'];
const MODES: StudyMode[] = ['full_time', 'part_time', 'online', 'hybrid'];
const PERIODS: TuitionPeriod[] = ['year', 'course'];

interface FormState {
  slug: string;
  institutionId: string;
  institutionLabel: string;
  title: string;
  level: StudyLevel;
  disciplines: string[];
  durationMonths: string;
  studyMode: StudyMode;
  campus: string;
  tuitionAmount: string;
  tuitionCurrency: string;
  tuitionPeriod: TuitionPeriod;
  tuitionIsEstimate: boolean;
  tuitionIsInternational: boolean;
  intakes: IntakeShape[];
  entryRequirements: RequirementGroupShape[];
  englishTests: EnglishTestShape[];
  scholarships: ScholarshipShape[];
  overview: string;
  highlights: string[];
  careers: string;
  offerResponseWeeks: string;
  fastTrackOffer: boolean;
}

const BLANK: FormState = {
  slug: '',
  institutionId: '',
  institutionLabel: '',
  title: '',
  level: 'postgraduate',
  disciplines: [],
  durationMonths: '',
  studyMode: 'full_time',
  campus: '',
  tuitionAmount: '',
  tuitionCurrency: '',
  tuitionPeriod: 'year',
  tuitionIsEstimate: false,
  tuitionIsInternational: true,
  intakes: [],
  entryRequirements: [],
  englishTests: [],
  scholarships: [],
  overview: '',
  highlights: [],
  careers: '',
  offerResponseWeeks: '',
  fastTrackOffer: false,
};

function fromDetail(detail: AdminCourseDetail): FormState {
  return {
    slug: detail.slug,
    institutionId: detail.institutionId,
    institutionLabel: '',
    title: detail.title,
    level: detail.level,
    disciplines: detail.disciplines,
    durationMonths: detail.durationMonths?.toString() ?? '',
    studyMode: detail.studyMode,
    campus: detail.campus ?? '',
    tuitionAmount: detail.tuitionAmount ?? '',
    tuitionCurrency: detail.tuitionCurrency ?? '',
    tuitionPeriod: detail.tuitionPeriod,
    tuitionIsEstimate: detail.tuitionIsEstimate,
    tuitionIsInternational: detail.tuitionIsInternational,
    intakes: detail.intakes,
    entryRequirements: detail.entryRequirements,
    englishTests: detail.englishTests,
    scholarships: detail.scholarships,
    overview: detail.overview ?? '',
    highlights: detail.highlights,
    careers: detail.careers ?? '',
    offerResponseWeeks: detail.offerResponseWeeks?.toString() ?? '',
    fastTrackOffer: detail.fastTrackOffer,
  };
}

function CourseEditor() {
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
      setForm(fromDetail(await client.getCourseDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this course. Please try again.',
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
        const created = await client.createCourse({
          slug: form.slug,
          institutionId: form.institutionId,
          title: form.title,
          level: form.level,
          disciplines: form.disciplines.filter((v) => v.trim()),
        });
        router.push(`/dashboard/catalogue/courses/${created.id}`);
      } else {
        await client.updateCourse(params.id, {
          slug: form.slug,
          institutionId: form.institutionId,
          title: form.title,
          level: form.level,
          disciplines: form.disciplines.filter((v) => v.trim()),
          durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
          studyMode: form.studyMode,
          campus: form.campus || null,
          tuitionAmount: form.tuitionAmount || null,
          tuitionCurrency: form.tuitionCurrency || null,
          tuitionPeriod: form.tuitionPeriod,
          tuitionIsEstimate: form.tuitionIsEstimate,
          tuitionIsInternational: form.tuitionIsInternational,
          intakes: form.intakes,
          entryRequirements: form.entryRequirements,
          englishTests: form.englishTests,
          scholarships: form.scholarships,
          overview: form.overview || null,
          highlights: form.highlights.filter((v) => v.trim()),
          careers: form.careers || null,
          offerResponseWeeks: form.offerResponseWeeks ? Number(form.offerResponseWeeks) : null,
          fastTrackOffer: form.fastTrackOffer,
        });
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this course. Please try again.',
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
    <section aria-labelledby="course-editor-heading">
      <h1 id="course-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New course' : 'Edit course'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the courses list — this screen is the
        record's own fields only.
        {isNew && ' The rest of the fields open up once this is created.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-3xl flex-col gap-8">
        <InstitutionPicker
          value={form.institutionId}
          valueLabel={form.institutionLabel}
          onChange={(id, label) => setForm((current) => ({ ...current, institutionId: id, institutionLabel: label }))}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Title" name="title" defaultValue={form.title} onChange={(e) => set('title', e.target.value)} required />
          <FormField label="Slug" name="slug" defaultValue={form.slug} onChange={(e) => set('slug', e.target.value)} required />

          <label className="flex flex-col gap-2 text-sm font-medium text-text">
            Level
            <select value={form.level} onChange={(e) => set('level', e.target.value as StudyLevel)} className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring">
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!isNew && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-text">
                Study mode
                <select value={form.studyMode} onChange={(e) => set('studyMode', e.target.value as StudyMode)} className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring">
                  {MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <FormField label="Campus" name="campus" defaultValue={form.campus} onChange={(e) => set('campus', e.target.value)} />
              <FormField label="Duration (months)" name="durationMonths" type="number" defaultValue={form.durationMonths} onChange={(e) => set('durationMonths', e.target.value)} />
              <FormField label="Offer response (weeks)" name="offerResponseWeeks" type="number" defaultValue={form.offerResponseWeeks} onChange={(e) => set('offerResponseWeeks', e.target.value)} />
              <FormField label="Tuition amount" name="tuitionAmount" placeholder="18500.00" defaultValue={form.tuitionAmount} onChange={(e) => set('tuitionAmount', e.target.value)} />
              <FormField label="Tuition currency" name="tuitionCurrency" placeholder="GBP" defaultValue={form.tuitionCurrency} onChange={(e) => set('tuitionCurrency', e.target.value.toUpperCase())} />

              <label className="flex flex-col gap-2 text-sm font-medium text-text">
                Tuition period
                <select value={form.tuitionPeriod} onChange={(e) => set('tuitionPeriod', e.target.value as TuitionPeriod)} className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring">
                  {PERIODS.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={form.tuitionIsEstimate} onChange={(e) => set('tuitionIsEstimate', e.target.checked)} />
                Tuition figure is an estimate
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={form.tuitionIsInternational} onChange={(e) => set('tuitionIsInternational', e.target.checked)} />
                Tuition figure is the international rate
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={form.fastTrackOffer} onChange={(e) => set('fastTrackOffer', e.target.checked)} />
                Fast-track offer partner
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="overview" className="text-sm font-medium text-text">
                Overview
              </label>
              <textarea
                id="overview"
                value={form.overview}
                onChange={(e) => set('overview', e.target.value)}
                rows={5}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="careers" className="text-sm font-medium text-text">
                Careers
              </label>
              <textarea
                id="careers"
                value={form.careers}
                onChange={(e) => set('careers', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>

            <StringArrayEditor label="Disciplines" values={form.disciplines} onChange={(v) => set('disciplines', v)} />
            <StringArrayEditor label="Highlights" values={form.highlights} onChange={(v) => set('highlights', v)} />

            <IntakesEditor values={form.intakes} onChange={(v) => set('intakes', v)} />
            <RequirementGroupsEditor values={form.entryRequirements} onChange={(v) => set('entryRequirements', v)} />
            <EnglishTestsEditor values={form.englishTests} onChange={(v) => set('englishTests', v)} />
            <ScholarshipsEditor values={form.scholarships} onChange={(v) => set('scholarships', v)} />
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={saving || !form.institutionId}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/dashboard/catalogue/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function CourseEditorPage() {
  return (
    <RequirePermission
      permissions={['catalogue.publish']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to edit the catalogue.</p>}
    >
      <CourseEditor />
    </RequirePermission>
  );
}
