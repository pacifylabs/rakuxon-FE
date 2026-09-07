import { emptyResult } from './types';
import { slugify } from './slug';
import type { CatalogueResult, CountryCount, Institution } from './types';

/**
 * Institutions and per-country counts from the Research Organization Registry.
 *
 * ROR is open (CC0), versioned, documented and needs no key, so unlike a
 * competitor's internal Next.js data route it is safe to depend on and safe to
 * republish. Filtered to education organisations.
 */
const ROR_ENDPOINT = 'https://api.ror.org/v2/organizations';

/** ISO-2 codes for the destinations the site actually covers. */
export const COVERED_COUNTRIES: readonly { code: string; name: string }[] = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'IE', name: 'Ireland' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
];

/** Cache for a day: institution registries move slowly. */
const REVALIDATE_SECONDS = 86_400;

interface RorName {
  value?: string;
  types?: string[];
}

interface RorLocation {
  geonames_details?: { country_code?: string; country_name?: string; name?: string };
}

interface RorOrganization {
  id?: string;
  names?: RorName[];
  links?: { type?: string; value?: string }[];
  locations?: RorLocation[];
}

function mapOrganization(org: RorOrganization): Institution | null {
  const name =
    org.names?.find((n) => n.types?.includes('ror_display'))?.value ?? org.names?.[0]?.value;
  const location = org.locations?.[0]?.geonames_details;
  if (!name || !org.id) return null;

  return {
    id: org.id,
    /* ROR ids are opaque URLs, so the route key is derived from the name. */
    slug: slugify(name),
    name,
    country: location?.country_name ?? 'Unknown',
    countryCode: location?.country_code ?? '',
    city: location?.name,
    website: org.links?.find((link) => link.type === 'website')?.value,
  };
}

function rorQuery(countryCode?: string, search?: string) {
  const filters = ['types:education'];
  if (countryCode) filters.push(`locations.geonames_details.country_code:${countryCode}`);

  const params = new URLSearchParams({ filter: filters.join(',') });
  if (search) params.set('query', search);
  return `${ROR_ENDPOINT}?${params.toString()}`;
}

export async function fetchInstitutions(options: {
  countryCode?: string;
  search?: string;
}): Promise<CatalogueResult<Institution>> {
  try {
    const response = await fetch(rorQuery(options.countryCode, options.search), {
      headers: { accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return emptyResult('unavailable', `Registry returned ${response.status}.`);
    }

    const payload = (await response.json()) as {
      items?: RorOrganization[];
      number_of_results?: number;
    };

    const items = (payload.items ?? []).map(mapOrganization).filter((i): i is Institution => !!i);
    return { items, total: payload.number_of_results ?? items.length, source: 'ror' };
  } catch {
    return emptyResult('unavailable', 'Could not reach the institution registry.');
  }
}

/**
 * Institution count per covered country. Requested one country at a time
 * because ROR reports the total for a filtered query, which is the number we
 * want; the request is cached for a day so this is six cheap lookups.
 */
export async function fetchCountryCounts(): Promise<CatalogueResult<CountryCount>> {
  try {
    const counts = await Promise.all(
      COVERED_COUNTRIES.map(async ({ code, name }) => {
        const response = await fetch(rorQuery(code), {
          headers: { accept: 'application/json' },
          next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!response.ok) return null;

        const payload = (await response.json()) as { number_of_results?: number };
        return {
          country: name,
          countryCode: code,
          institutions: payload.number_of_results ?? 0,
        } satisfies CountryCount;
      }),
    );

    const items = counts.filter((c): c is CountryCount => c !== null);
    if (items.length === 0) return emptyResult('unavailable', 'No counts available.');

    return { items, total: items.length, source: 'ror' };
  } catch {
    return emptyResult('unavailable', 'Could not reach the institution registry.');
  }
}
