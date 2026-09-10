import { FormField, SelectField } from '@rakuxon/ui';
import type { Address, ReferenceCountry } from '@rakuxon/contract';

import { toCountryOptions } from './countryOptions';

export function AddressSection({
  address,
  countries,
  onChange,
}: {
  address: Address;
  countries: ReferenceCountry[];
  onChange: (address: Address) => void;
}) {
  const set = <K extends keyof Address>(key: K, value: Address[K]) =>
    onChange({ ...address, [key]: value });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-heading text-lg font-semibold text-text">Address</h2>

      <FormField
        label="Address line 1"
        name="line1"
        defaultValue={address.line1 ?? ''}
        onChange={(event) => set('line1', event.target.value)}
      />
      <FormField
        label="Address line 2"
        name="line2"
        placeholder="Optional"
        defaultValue={address.line2 ?? ''}
        onChange={(event) => set('line2', event.target.value)}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="City"
          name="city"
          defaultValue={address.city ?? ''}
          onChange={(event) => set('city', event.target.value)}
        />
        <FormField
          label="Region / state"
          name="region"
          defaultValue={address.region ?? ''}
          onChange={(event) => set('region', event.target.value)}
        />
        <FormField
          label="Postal code"
          name="postalCode"
          defaultValue={address.postalCode ?? ''}
          onChange={(event) => set('postalCode', event.target.value)}
        />
        <SelectField
          label="Country"
          name="countryCode"
          placeholder="Select a country"
          options={toCountryOptions(countries)}
          value={address.countryCode ?? ''}
          onChange={(value) => set('countryCode', value || undefined)}
        />
      </div>
    </div>
  );
}
