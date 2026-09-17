import { createResilientJsonFetcher } from '../http/resilient-json';

/**
 * Admin-authored testimonials, replacing what used to be hardcoded content
 * arrays. Fails soft like the rest of the catalogue reads — a page still has
 * to render when this is slow or down, it just shows no testimonial section.
 */

const BASE_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

const { getJson, reportFailure } = createResilientJsonFetcher({
  baseUrl: `${BASE_URL}/v1/testimonials`,
  logLabel: '[testimonials]',
});

export interface ApiTestimonial {
  id: string;
  quote: string;
  authorName: string;
  detail: string;
  photoUrl: string | null;
}

export type TestimonialPlacement = 'home' | 'students';

export async function fetchTestimonials(
  placement: TestimonialPlacement,
  limit = 6,
): Promise<ApiTestimonial[]> {
  const path = `?placement=${placement}&limit=${limit}`;
  try {
    return await getJson<ApiTestimonial[]>(path, 300);
  } catch (error) {
    reportFailure(path, error);
    return [];
  }
}
