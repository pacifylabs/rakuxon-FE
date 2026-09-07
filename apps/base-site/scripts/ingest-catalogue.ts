/**
 * Catalogue ingestion — fetch, normalise, save.
 *
 * Today the institution list is fetched from ROR on every request and kept
 * only in Next's data cache, which means it disappears on redeploy, differs
 * between instances, and cannot be edited, curated or unpublished. This script
 * is the answer to that: it pulls once, normalises into our own shapes, and
 * writes a durable snapshot the app reads instead.
 *
 *   pnpm ingest:catalogue                 # every covered country
 *   pnpm ingest:catalogue --country GB    # one
 *   pnpm ingest:catalogue --dry-run       # fetch and report, write nothing
 *
 * Output: src/lib/catalogue/data/institutions.<cc>.json, one file per country,
 * each row carrying its provenance. Re-running updates in place and never
 * duplicates, because rows are matched on their ROR id before merging.
 *
 * SOURCES
 * -------
 * ROR (Research Organization Registry) only, for now. It is CC0, versioned,
 * documented, needs no key, and explicitly permits redistribution — so a
 * snapshot of it is ours to store, edit and serve. Adding a source means
 * adding an adapter below and recording its licence in
 * `rakuxon-BE/docs/10-catalogue-data.md` §5 FIRST. A source whose terms forbid
 * extraction does not become acceptable by being written to disk; storing it
 * is the part those terms are usually about.
 *
 * WHAT THIS DOES NOT COVER
 * ------------------------
 * Course-level data — fees, intakes, entry requirements. No open dataset
 * publishes it, which is why `bank.ts` still carries a hand-written sample set
 * clearly marked as such. Real course data comes from the partner feeds
 * described in `10-catalogue-data.md` §5, and this pipeline is where it lands
 * when it does.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { COVERED_COUNTRIES } from '../src/lib/catalogue/institutions';
import { slugify } from '../src/lib/catalogue/slug';
import type { Institution, Provenance } from '../src/lib/catalogue/types';

const ROR_ENDPOINT = 'https://api.ror.org/v2/organizations';
const OUT_DIR = join(process.cwd(), 'src/lib/catalogue/data');

/** Politeness: ROR is a free public service and asks for reasonable use. */
const PAGE_DELAY_MS = 400;
const MAX_PAGES = 20;

const LICENCE = 'CC0 1.0 Universal (ROR data is dedicated to the public domain)';

interface StoredInstitution extends Institution {
  provenance: Provenance;
}

interface RorOrganization {
  id?: string;
  names?: { value?: string; types?: string[] }[];
  links?: { type?: string; value?: string }[];
  locations?: {
    geonames_details?: { country_code?: string; country_name?: string; name?: string };
  }[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalise(org: RorOrganization, retrievedAt: string): StoredInstitution | null {
  const name =
    org.names?.find((entry) => entry.types?.includes('ror_display'))?.value ??
    org.names?.[0]?.value;
  const location = org.locations?.[0]?.geonames_details;

  if (!name || !org.id) return null;

  return {
    id: org.id,
    slug: slugify(name),
    name,
    country: location?.country_name ?? 'Unknown',
    countryCode: location?.country_code ?? '',
    city: location?.name,
    website: org.links?.find((link) => link.type === 'website')?.value,
    provenance: {
      sourceId: 'ror',
      sourceRecordId: org.id,
      sourceUrl: org.id,
      licence: LICENCE,
      retrievedAt,
    },
  };
}

async function fetchCountry(code: string, retrievedAt: string): Promise<StoredInstitution[]> {
  const rows: StoredInstitution[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `${ROR_ENDPOINT}?filter=types:education,locations.geonames_details.country_code:${code}&page=${page}`;
    const response = await fetch(url, { headers: { accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`ROR responded ${response.status} for ${code} page ${page}`);
    }

    const payload = (await response.json()) as {
      items?: RorOrganization[];
      number_of_results?: number;
    };
    const items = payload.items ?? [];
    if (items.length === 0) break;

    for (const org of items) {
      const row = normalise(org, retrievedAt);
      if (row) rows.push(row);
    }

    process.stdout.write(`  ${code} page ${page}: ${rows.length} rows\n`);
    if (rows.length >= (payload.number_of_results ?? 0)) break;

    await sleep(PAGE_DELAY_MS);
  }

  return rows;
}

/**
 * Match on the source id, then merge field by field.
 *
 * A blind overwrite would let a sparser later fetch blank a field an earlier
 * one filled, and a blind append would duplicate every row on the second run.
 */
function merge(
  existing: readonly StoredInstitution[],
  incoming: readonly StoredInstitution[],
): StoredInstitution[] {
  const byId = new Map(existing.map((row) => [row.id, row]));

  for (const row of incoming) {
    const previous = byId.get(row.id);
    byId.set(
      row.id,
      previous
        ? {
            ...previous,
            ...Object.fromEntries(
              Object.entries(row).filter(([, value]) => value !== undefined && value !== ''),
            ),
          }
        : row,
    );
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function readExisting(path: string): Promise<StoredInstitution[]> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as StoredInstitution[];
  } catch {
    return [];
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const only = args[args.indexOf('--country') + 1];
  const countries = args.includes('--country')
    ? COVERED_COUNTRIES.filter((entry) => entry.code === only)
    : COVERED_COUNTRIES;

  if (countries.length === 0) throw new Error(`No covered country matches "${only}".`);

  const retrievedAt = new Date().toISOString().slice(0, 10);
  if (!dryRun) await mkdir(OUT_DIR, { recursive: true });

  for (const country of countries) {
    process.stdout.write(`\n${country.name} (${country.code})\n`);
    const rows = await fetchCountry(country.code, retrievedAt);
    const path = join(OUT_DIR, `institutions.${country.code.toLowerCase()}.json`);
    const merged = merge(await readExisting(path), rows);

    if (dryRun) {
      process.stdout.write(`  would write ${merged.length} rows to ${path}\n`);
      continue;
    }

    await writeFile(path, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    process.stdout.write(`  wrote ${merged.length} rows to ${path}\n`);
  }

  process.stdout.write('\nDone. Every row carries sourceId, licence and retrievedAt.\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
