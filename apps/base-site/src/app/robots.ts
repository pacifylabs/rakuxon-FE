import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';

/**
 * Everything under `(app)` needs a session to show anything real, so a
 * crawler hitting one gets a login wall, not content — disallowing it keeps
 * the index limited to pages a visitor can actually act on without one.
 * Auth flows (`/login`, `/register`, the token-bearing routes) are the same
 * story: no content of their own to rank, and a token in a crawled URL is a
 * token search engines should never see.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/*',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/reset-password/*',
        '/verify-email',
        '/verify-email/*',
        '/invite',
        '/invite/*',
        '/sso',
        '/sso/*',
        '/api/*',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
