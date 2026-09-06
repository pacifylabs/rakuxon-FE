/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // packages/ui ships TypeScript source (Turborepo just-in-time package).
  transpilePackages: ['@rakuxon/ui', '@rakuxon/config'],
  images: {
    // Marketing photography is hotlinked from Unsplash/Pexels per
    // docs/04b-multipage-site-spec.md § 12. Narrowed to the exact image CDN
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
    ],
  },
};

export default nextConfig;
