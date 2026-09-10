import { FormField, SelectField } from '@rakuxon/ui';
import type { ReferenceCountry, StudentProfile } from '@rakuxon/contract';

import { toDestinationOptions } from './countryOptions';
import { STUDY_LEVELS } from './studyLevels';
import type { UpdateProfileField } from './types';

export function StudyPreferencesSection({
  profile,
  countries,
  onChange,
}: {
  profile: StudentProfile;
  countries: ReferenceCountry[];
  onChange: UpdateProfileField;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-heading text-lg font-semibold text-text">Study preferences</h2>

      <SelectField
        label="Study level"
        name="intendedStudyLevel"
        placeholder="Select a level"
        options={STUDY_LEVELS}
        value={profile.intendedStudyLevel ?? ''}
        onChange={(value) =>
          onChange('intendedStudyLevel', (value || undefined) as StudentProfile['intendedStudyLevel'])
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Intended country"
          name="intendedCountry"
          placeholder="Select a destination"
          options={toDestinationOptions(countries)}
          value={profile.intendedCountry ?? ''}
          onChange={(value) => onChange('intendedCountry', value || null)}
        />
        <FormField
          label="Preferred intake"
          name="preferredIntake"
          placeholder="e.g. 2026-09"
          defaultValue={profile.preferredIntake ?? ''}
          onChange={(event) => onChange('preferredIntake', event.target.value)}
        />
      </div>
    </div>
  );
}
