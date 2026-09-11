import type { MetadataRoute } from 'next';

import { COUNTRY_SLUGS, ROUTES, articleRoute, countryRoute, courseRoute, serviceRoute, universityRoute } from '@/content/routes';
import { SERVICES } from '@/content/services';
import { fetchArticles, fetchCourses, fetchInstitutions } from '@/lib/catalogue/api';
import { absoluteUrl } from '@/lib/site-url';

/* Regenerated hourly rather than on every crawl — a sitemap this size is not
   worth rebuilding per request, and an hour is well inside how often the
   catalogue actually changes. */
export const revalidate = 3600;

/** The public API's own ceiling per page (`@Max(100)` on the list DTOs). */
const API_PAGE_SIZE = 100;

/** Public marketing routes only — everything `robots.ts` disallows has no reason to be listed here either. */
const STATIC_ROUTE_PRIORITY: Record<string, number> = {
  [ROUTES.home]: 1,
  [ROUTES.explore]: 0.9,
  [ROUTES.universities]: 0.8,
  [ROUTES.destinations]: 0.8,
  [ROUTES.services]: 0.8,
  [ROUTES.students]: 0.7,
  [ROUTES.agencies]: 0.7,
  [ROUTES.institutions]: 0.7,
  [ROUTES.resources]: 0.7,
  [ROUTES.about]: 0.5,
  [ROUTES.contact]: 0.5,
  [ROUTES.privacy]: 0.2,
  [ROUTES.terms]: 0.2,
};

/**
 * A single flat sitemap. Today's catalogue (institutions plus everything
 * else) sits around 3,500 URLs — nowhere near Google's 50,000-per-file cap,
 * so the multi-file `generateSitemaps` split (which serves `/sitemap/0.xml`,
 * `/sitemap/1.xml`, ... instead of one `/sitemap.xml`, and needs each
 * discovered separately) is not worth the extra moving part yet. Revisit
 * this once the catalogue is actually large enough to need it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = Object.entries(STATIC_ROUTE_PRIORITY).map(([path, priority]) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === ROUTES.home ? 'daily' : 'weekly',
    priority,
  }));

  const countryEntries: MetadataRoute.Sitemap = COUNTRY_SLUGS.map((slug) => ({
    url: absoluteUrl(countryRoute(slug)),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: absoluteUrl(serviceRoute(service.id)),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const { total: institutionTotal } = await fetchInstitutions({ limit: 1 });
  const institutionPages = Math.max(1, Math.ceil(institutionTotal / API_PAGE_SIZE));

  const [{ items: articles }, { items: courses }, ...institutionPageResults] = await Promise.all([
    fetchArticles({ limit: API_PAGE_SIZE }),
    fetchCourses({ limit: API_PAGE_SIZE }),
    ...Array.from({ length: institutionPages }, (_, index) =>
      fetchInstitutions({ page: index + 1, limit: API_PAGE_SIZE }),
    ),
  ]);

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(articleRoute(article.slug)),
    lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
    url: absoluteUrl(courseRoute(course.slug)),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const institutionEntries: MetadataRoute.Sitemap = institutionPageResults
    .flatMap((page) => page.items)
    .map((institution) => ({
      url: absoluteUrl(universityRoute(institution.slug)),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [
    ...staticEntries,
    ...countryEntries,
    ...serviceEntries,
    ...articleEntries,
    ...courseEntries,
    ...institutionEntries,
  ];
}
