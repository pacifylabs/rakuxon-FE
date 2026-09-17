import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/login', destination: '/auth/login', permanent: false },
      { source: '/register', destination: '/auth/register', permanent: false },
      { source: '/forgot-password', destination: '/auth/forgot-password', permanent: false },
      { source: '/reset-password/:token', destination: '/auth/reset-password/:token', permanent: false },
      { source: '/verify-email/:token', destination: '/auth/verify-email/:token', permanent: false },
      { source: '/invite/:token', destination: '/auth/invite/:token', permanent: false },
      { source: '/sso/callback', destination: '/auth/sso/callback', permanent: false },
    ];
  },
  output: 'standalone',
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  poweredByHeader: false,
  experimental: { cpus: 2 },
  // packages/ui ships TypeScript source (Turborepo just-in-time package).
  transpilePackages: [
    '@rakuxon/ui',
    '@rakuxon/config',
    '@rakuxon/auth',
    '@rakuxon/api-client',
    '@rakuxon/contract',
  ],
  images: {
    // Marketing photography is hotlinked from Unsplash/Pexels per
    // docs/04b-multipage-site-spec.md § 12, plus Wikimedia Commons for real
    // institution photos the Wikidata enrichment pipeline sources (the
    // homepage's featured-institutions showcase and, in principle, any other
    // grid of them — a single one-off hero uses a plain `<img>` instead,
    // see the university detail page). Narrowed to the exact image CDN
    // hosts and their path prefixes — not a wildcard on the whole domain.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/wiki/Special:FilePath/**',
      },
    ],
  },
};

export default nextConfig;
