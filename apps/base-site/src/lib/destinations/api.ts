import type { DestinationCard, DestinationGuide } from '@rakuxon/contract';

import { createResilientJsonFetcher } from '../http/resilient-json';

/**
 * The written destination guides, admin-authored — replacing what used to be
 * a hardcoded array in `content/destinations.ts`. The card list fails soft
 * to an empty grid (a marketing page has to render even when the API is
 * slow or asleep); a single guide has nothing to fall back to, so a failure
 * there is treated the same as "no guide", which the caller turns into a 404.
 */

const BASE_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

const { getJson, reportFailure } = createResilientJsonFetcher({
  baseUrl: `${BASE_URL}/v1/destinations`,
  logLabel: '[destinations]',
});

export async function fetchDestinationCards(): Promise<DestinationCard[]> {
  try {
    return await getJson<DestinationCard[]>('', 300);
  } catch (error) {
    reportFailure('', error);
    return [];
  }
}

export async function fetchDestinationGuide(slug: string): Promise<DestinationGuide | null> {
  try {
    return await getJson<DestinationGuide>(`/${slug}`, 300);
  } catch (error) {
    reportFailure(`/${slug}`, error);
    return null;
  }
}
