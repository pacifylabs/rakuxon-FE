'use client';

import { GraduationCap, Settings2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { useApiClient } from '@rakuxon/auth';
import { Button, ProgressBar, Tabs } from '@rakuxon/ui';
import type { EducationHistoryEntry, ReferenceCountry, StudentProfile } from '@rakuxon/contract';

import { AddressSection } from '@/components/dashboard/profile/AddressSection';
import { profileCompleteness } from '@/components/dashboard/profile/completeness';
import { EducationHistorySection } from '@/components/dashboard/profile/EducationHistorySection';
import { PersonalDetailsSection } from '@/components/dashboard/profile/PersonalDetailsSection';
import { StudyPreferencesSection } from '@/components/dashboard/profile/StudyPreferencesSection';
import type { UpdateProfileField } from '@/components/dashboard/profile/types';

const emptyEntry: EducationHistoryEntry = { institutionName: '', qualification: '' };

export default function ProfilePage() {
  const client = useApiClient();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [countries, setCountries] = useState<ReferenceCountry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await client.getMyProfile();
        if (!cancelled) setProfile(loaded);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError || error instanceof NetworkError
            ? error.message
            : 'Could not load your profile. Please try again.',
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await client.listReferenceCountries();
        if (!cancelled) setCountries(loaded);
      } catch (error) {
        /* A missing country list degrades the form to an empty dropdown, not
           a broken page — logged, not surfaced, since it isn't the field the
           visitor came to fill in. */
        console.error('[profile] country list failed to load:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const update: UpdateProfileField = (key, value) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  };

  function updateEducation(index: number, patch: Partial<EducationHistoryEntry>) {
    setProfile((current) => {
      if (!current) return current;
      const educationHistory = current.educationHistory.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      );
      return { ...current, educationHistory };
    });
    setSaved(false);
  }

  function addEducationEntry() {
    setProfile((current) =>
      current
        ? { ...current, educationHistory: [...current.educationHistory, { ...emptyEntry }] }
        : current,
    );
  }

  function removeEducationEntry(index: number) {
    setProfile((current) =>
      current
        ? { ...current, educationHistory: current.educationHistory.filter((_, i) => i !== index) }
        : current,
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await client.updateMyProfile({
        dateOfBirth: profile.dateOfBirth ?? undefined,
        nationality: profile.nationality ?? undefined,
        phone: profile.phone ?? undefined,
        passportNumber: profile.passportNumber ?? undefined,
        address: profile.address,
        educationHistory: profile.educationHistory.filter((entry) => entry.institutionName),
        intendedStudyLevel: profile.intendedStudyLevel ?? undefined,
        intendedCountry: profile.intendedCountry ?? undefined,
        preferredIntake: profile.preferredIntake ?? undefined,
      });
      setProfile(updated);
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Could not save your profile. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <section aria-labelledby="profile-heading">
        <h1 id="profile-heading" className="font-heading text-3xl font-bold text-text">
          Profile
        </h1>
        <p role="alert" className="mt-4 max-w-prose text-base text-danger">
          {loadError}
        </p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section aria-labelledby="profile-heading">
        <h1 id="profile-heading" className="font-heading text-3xl font-bold text-text">
          Profile
        </h1>
        <p role="status" className="mt-4 text-base text-text-muted">
          Loading…
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="profile-heading">
      <h1 id="profile-heading" className="font-heading text-3xl font-bold text-text">
        Profile
      </h1>
      <p className="mt-2 max-w-prose text-base text-text-muted">
        The details admissions teams need to process your application. Save as you go — nothing
        here has to be finished in one sitting.
      </p>

      <div className="mt-6 max-w-2xl">
        <ProgressBar
          label={profile.profileCompletedAt ? 'Profile complete' : 'Profile completeness'}
          percent={profileCompleteness(profile)}
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <Tabs
          tabs={[
            {
              id: 'basic',
              label: 'Basic info',
              icon: <User aria-hidden="true" className="size-4" />,
              content: (
                <div className="flex flex-col gap-10">
                  <PersonalDetailsSection profile={profile} countries={countries} onChange={update} />
                  <AddressSection
                    address={profile.address}
                    countries={countries}
                    onChange={(address) => update('address', address)}
                  />
                </div>
              ),
            },
            {
              id: 'qualifications',
              label: 'Qualifications',
              icon: <GraduationCap aria-hidden="true" className="size-4" />,
              content: (
                <EducationHistorySection
                  entries={profile.educationHistory}
                  onChange={updateEducation}
                  onAdd={addEducationEntry}
                  onRemove={removeEducationEntry}
                />
              ),
            },
            {
              id: 'preferences',
              label: 'Preferences',
              icon: <Settings2 aria-hidden="true" className="size-4" />,
              content: (
                <StudyPreferencesSection profile={profile} countries={countries} onChange={update} />
              ),
            },
          ]}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-border pt-8">
        <Button type="button" size="lg" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && (
          <p role="status" className="text-sm font-medium text-primary">
            Saved.
          </p>
        )}
        {saveError && (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        )}
      </div>
    </section>
  );
}
