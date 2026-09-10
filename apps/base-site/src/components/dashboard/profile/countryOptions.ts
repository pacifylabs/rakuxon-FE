import type { ReferenceCountry } from '@rakuxon/contract';
import type { SelectFieldOption } from '@rakuxon/ui';

/** Every country, for nationality and address — already sorted by name by the API. */
export function toCountryOptions(countries: ReferenceCountry[]): SelectFieldOption[] {
  return countries.map((country) => ({
    value: country.code,
    label: `${country.flagEmoji} ${country.name}`,
  }));
}

/** Only where the catalogue actually has universities — for "where do you want to study". */
export function toDestinationOptions(countries: ReferenceCountry[]): SelectFieldOption[] {
  return countries
    .filter((country) => country.isDestination)
    .map((country) => ({ value: country.code, label: `${country.flagEmoji} ${country.name}` }));
}
