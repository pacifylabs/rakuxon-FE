import { SelectField } from '@rakuxon/ui';
import type { IntakeTerm, ReferenceCountry, StudentProfile } from '@rakuxon/contract';

import { toDestinationOptions } from './countryOptions';
import { STUDY_LEVELS } from './studyLevels';
import type { UpdateProfileField } from './types';

export function StudyPreferencesSection({
  profile,
  countries,
  intakeTerms,
  onChange,
}: {
  profile: StudentProfile;
  countries: ReferenceCountry[];
  intakeTerms: IntakeTerm[];
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
        <SelectField
          label="Preferred intake"
          name="preferredIntake"
          placeholder="Select an intake"
          options={intakeTerms.map((term) => ({ value: term.label, label: term.label }))}
          value={profile.preferredIntake ?? ''}
          onChange={(value) => onChange('preferredIntake', value || null)}
        />
      </div>
    </div>
  );
}
