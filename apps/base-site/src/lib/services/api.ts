import { createResilientJsonFetcher } from '../http/resilient-json';

/**
 * Admin-authored services, replacing what used to be a hardcoded array in
 * `content/services.ts`. Fails soft like the rest of the catalogue reads — a
 * page still has to render when this is slow or down.
 */

const BASE_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

const { getJson, reportFailure } = createResilientJsonFetcher({
  baseUrl: `${BASE_URL}/v1/services`,
  logLabel: '[services]',
});

export interface ApiServiceFaq {
  question: string;
  answer: string;
}

export interface ApiService {
  id: string;
  slug: string;
  iconName: string;
  title: string;
  summary: string;
  description: string;
  strand: 'education' | 'travel';
  metaTitle: string;
  metaDescription: string;
  whatsIncluded: string[];
  faqs: ApiServiceFaq[];
  relatedArticleSlugs: string[] | null;
}

/** Published services, in display order. */
export async function fetchServices(): Promise<ApiService[]> {
  try {
    return await getJson<ApiService[]>('', 300);
  } catch (error) {
    reportFailure('', error);
    return [];
  }
}

export async function fetchService(slug: string): Promise<ApiService | null> {
  try {
    return await getJson<ApiService>(`/${encodeURIComponent(slug)}`, 300);
  } catch (error) {
    reportFailure(`/${slug}`, error);
    return null;
  }
}
