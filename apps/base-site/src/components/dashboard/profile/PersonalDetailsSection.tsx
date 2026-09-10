import { FormField, SelectField } from '@rakuxon/ui';
import type { ReferenceCountry, StudentProfile } from '@rakuxon/contract';

import { toCountryOptions } from './countryOptions';
import type { UpdateProfileField } from './types';

export function PersonalDetailsSection({
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
      <h2 className="font-heading text-lg font-semibold text-text">Personal details</h2>

      <FormField
        label="Date of birth"
        name="dateOfBirth"
        type="date"
        defaultValue={profile.dateOfBirth ?? ''}
        onChange={(event) => onChange('dateOfBirth', event.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Nationality"
          name="nationality"
          placeholder="Select a country"
          options={toCountryOptions(countries)}
          value={profile.nationality ?? ''}
          onChange={(value) => onChange('nationality', value || null)}
        />
        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+234 801 234 5678"
          defaultValue={profile.phone ?? ''}
          onChange={(event) => onChange('phone', event.target.value)}
        />
      </div>

      <FormField
        label="Passport number"
        name="passportNumber"
        placeholder="Optional, for now"
        defaultValue={profile.passportNumber ?? ''}
        onChange={(event) => onChange('passportNumber', event.target.value)}
      />
    </div>
  );
}
