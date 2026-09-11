'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { Button, FormField } from '@rakuxon/ui';
import type {
  AdminInstitutionDetail,
  CampusShape,
  EnglishTestShape,
  FaqShape,
  QualityRatingShape,
  RequirementGroupShape,
} from '@rakuxon/contract';

import { CampusesEditor } from '@/components/dashboard/editors/CampusesEditor';
import { EnglishTestsEditor } from '@/components/dashboard/editors/EnglishTestsEditor';
import { FaqsEditor } from '@/components/dashboard/editors/FaqsEditor';
import { QualityRatingsEditor } from '@/components/dashboard/editors/QualityRatingsEditor';
import { RequirementGroupsEditor } from '@/components/dashboard/editors/RequirementGroupsEditor';
import { StringArrayEditor } from '@/components/dashboard/editors/StringArrayEditor';
import { RequirePermission, useAdminApiClient } from '@/lib/admin-auth';

interface FormState {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  website: string;
  about: string;
  logoUrl: string;
  heroImageUrl: string;
  overview: string;
  overviewSourceUrl: string;
  motto: string;
  employability: string;
  foundedYear: string;
  studentCount: string;
  tuitionFrom: string;
  tuitionCurrency: string;
  upcomingIntake: string;
  fastTrackOffer: boolean;
  aka: string[];
  highlights: string[];
  memberships: string[];
  campuses: CampusShape[];
  requiredDocuments: RequirementGroupShape[];
  englishTests: EnglishTestShape[];
  faqs: FaqShape[];
  qualityRatings: QualityRatingShape[];
}

const BLANK: FormState = {
  slug: '',
  name: '',
  country: '',
  countryCode: '',
  city: '',
  website: '',
  about: '',
  logoUrl: '',
  heroImageUrl: '',
  overview: '',
  overviewSourceUrl: '',
  motto: '',
  employability: '',
  foundedYear: '',
  studentCount: '',
  tuitionFrom: '',
  tuitionCurrency: '',
  upcomingIntake: '',
  fastTrackOffer: false,
  aka: [],
  highlights: [],
  memberships: [],
  campuses: [],
  requiredDocuments: [],
  englishTests: [],
  faqs: [],
  qualityRatings: [],
};

function fromDetail(detail: AdminInstitutionDetail): FormState {
  return {
    slug: detail.slug,
    name: detail.name,
    country: detail.country,
    countryCode: detail.countryCode,
    city: detail.city ?? '',
    website: detail.website ?? '',
    about: detail.about ?? '',
    logoUrl: detail.logoUrl ?? '',
    heroImageUrl: detail.heroImageUrl ?? '',
    overview: detail.overview ?? '',
    overviewSourceUrl: detail.overviewSourceUrl ?? '',
    motto: detail.motto ?? '',
    employability: detail.employability ?? '',
    foundedYear: detail.foundedYear?.toString() ?? '',
    studentCount: detail.studentCount?.toString() ?? '',
    tuitionFrom: detail.tuitionFrom ?? '',
    tuitionCurrency: detail.tuitionCurrency ?? '',
    upcomingIntake: detail.upcomingIntake ?? '',
    fastTrackOffer: detail.fastTrackOffer,
    aka: detail.aka,
    highlights: detail.highlights,
    memberships: detail.memberships,
    campuses: detail.campuses,
    requiredDocuments: detail.requiredDocuments,
    englishTests: detail.englishTests,
    faqs: detail.faqs,
    qualityRatings: detail.qualityRatings,
  };
}

function InstitutionEditor() {
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
      setForm(fromDetail(await client.getInstitutionDetail(params.id)));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load this institution. Please try again.',
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
        const created = await client.createInstitution({
          slug: form.slug,
          name: form.name,
          country: form.country,
          countryCode: form.countryCode,
          city: form.city || undefined,
          website: form.website || undefined,
          about: form.about || undefined,
        });
        router.push(`/dashboard/catalogue/institutions/${created.id}`);
      } else {
        await client.updateInstitution(params.id, {
          slug: form.slug,
          name: form.name,
          country: form.country,
          countryCode: form.countryCode,
          city: form.city || null,
          website: form.website || null,
          about: form.about || null,
          logoUrl: form.logoUrl || null,
          heroImageUrl: form.heroImageUrl || null,
          overview: form.overview || null,
          overviewSourceUrl: form.overviewSourceUrl || null,
          motto: form.motto || null,
          employability: form.employability || null,
          foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
          studentCount: form.studentCount ? Number(form.studentCount) : null,
          tuitionFrom: form.tuitionFrom || null,
          tuitionCurrency: form.tuitionCurrency || null,
          upcomingIntake: form.upcomingIntake || null,
          fastTrackOffer: form.fastTrackOffer,
          aka: form.aka.filter((v) => v.trim()),
          highlights: form.highlights.filter((v) => v.trim()),
          memberships: form.memberships.filter((v) => v.trim()),
          campuses: form.campuses,
          requiredDocuments: form.requiredDocuments,
          englishTests: form.englishTests,
          faqs: form.faqs,
          qualityRatings: form.qualityRatings,
        });
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not save this institution. Please try again.',
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
    <section aria-labelledby="institution-editor-heading">
      <h1 id="institution-editor-heading" className="font-heading text-3xl font-bold text-text">
        {isNew ? 'New institution' : 'Edit institution'}
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        Status (draft/published/suspended) is managed from the institutions list — this screen is
        the record's own fields only.
        {isNew && ' The rest of the fields open up once this is created.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-3xl flex-col gap-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Name" name="name" defaultValue={form.name} onChange={(e) => set('name', e.target.value)} required />
          <FormField label="Slug" name="slug" defaultValue={form.slug} onChange={(e) => set('slug', e.target.value)} required />
          <FormField label="Country" name="country" defaultValue={form.country} onChange={(e) => set('country', e.target.value)} required />
          <FormField label="Country code" name="countryCode" placeholder="GB" defaultValue={form.countryCode} onChange={(e) => set('countryCode', e.target.value.toUpperCase())} required />
          <FormField label="City" name="city" defaultValue={form.city} onChange={(e) => set('city', e.target.value)} />
          <FormField label="Website" name="website" defaultValue={form.website} onChange={(e) => set('website', e.target.value)} />
        </div>

        {!isNew && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Logo URL" name="logoUrl" defaultValue={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
              <FormField label="Hero image URL" name="heroImageUrl" defaultValue={form.heroImageUrl} onChange={(e) => set('heroImageUrl', e.target.value)} />
              <FormField label="Motto" name="motto" defaultValue={form.motto} onChange={(e) => set('motto', e.target.value)} />
              <FormField label="Founded year" name="foundedYear" type="number" defaultValue={form.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} />
              <FormField label="Student count" name="studentCount" type="number" defaultValue={form.studentCount} onChange={(e) => set('studentCount', e.target.value)} />
              <FormField label="Upcoming intake" name="upcomingIntake" placeholder="Sep 2026" defaultValue={form.upcomingIntake} onChange={(e) => set('upcomingIntake', e.target.value)} />
              <FormField label="Tuition from" name="tuitionFrom" placeholder="18500.00" defaultValue={form.tuitionFrom} onChange={(e) => set('tuitionFrom', e.target.value)} />
              <FormField label="Tuition currency" name="tuitionCurrency" placeholder="GBP" defaultValue={form.tuitionCurrency} onChange={(e) => set('tuitionCurrency', e.target.value.toUpperCase())} />
            </div>

            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" checked={form.fastTrackOffer} onChange={(e) => set('fastTrackOffer', e.target.checked)} />
              Fast-track offer partner
            </label>

            <div className="flex flex-col gap-2">
              <label htmlFor="about" className="text-sm font-medium text-text">
                About
              </label>
              <textarea
                id="about"
                value={form.about}
                onChange={(e) => set('about', e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="overview" className="text-sm font-medium text-text">
                Overview
              </label>
              <textarea
                id="overview"
                value={form.overview}
                onChange={(e) => set('overview', e.target.value)}
                rows={6}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
              <FormField label="Overview source URL" name="overviewSourceUrl" defaultValue={form.overviewSourceUrl} onChange={(e) => set('overviewSourceUrl', e.target.value)} hint="Required if the overview text is quoted from elsewhere." />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="employability" className="text-sm font-medium text-text">
                Employability
              </label>
              <textarea
                id="employability"
                value={form.employability}
                onChange={(e) => set('employability', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
              />
            </div>

            <StringArrayEditor label="Alternate names (aka)" values={form.aka} onChange={(v) => set('aka', v)} />
            <StringArrayEditor label="Highlights" values={form.highlights} onChange={(v) => set('highlights', v)} />
            <StringArrayEditor label="Memberships" values={form.memberships} onChange={(v) => set('memberships', v)} placeholder="Russell Group" />

            <CampusesEditor values={form.campuses} onChange={(v) => set('campuses', v)} />
            <RequirementGroupsEditor values={form.requiredDocuments} onChange={(v) => set('requiredDocuments', v)} />
            <EnglishTestsEditor values={form.englishTests} onChange={(v) => set('englishTests', v)} />
            <FaqsEditor values={form.faqs} onChange={(v) => set('faqs', v)} />
            <QualityRatingsEditor values={form.qualityRatings} onChange={(v) => set('qualityRatings', v)} />
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/dashboard/catalogue/institutions')}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function InstitutionEditorPage() {
  return (
    <RequirePermission
      permissions={['catalogue.publish']}
      denied={<p className="text-base text-text-muted">Your account does not have permission to edit the catalogue.</p>}
    >
      <InstitutionEditor />
    </RequirePermission>
  );
}
