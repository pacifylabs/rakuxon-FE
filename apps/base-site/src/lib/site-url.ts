/**
 * The canonical origin every absolute URL on this site is built from —
 * canonical links, sitemap entries, JSON-LD `url` fields, and the base
 * `openGraph`/`metadataBase` in the root layout.
 *
 * Falls back to the real production domain rather than a placeholder: this
 * runs at build/request time on Vercel too, and an env var nobody set should
 * not silently produce `https://localhost:3000` links in a sitemap that
 * search engines then crawl.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rakuxon.com').replace(/\/+$/, '');

/** `/courses/foo` -> `https://rakuxon.com/courses/foo`. Already-absolute input passes through. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
