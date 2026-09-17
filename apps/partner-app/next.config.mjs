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
      { source: '/sso/callback', destination: '/auth/sso/callback', permanent: false },
    ];
  },
  output: 'standalone',
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  poweredByHeader: false,
  experimental: { cpus: 2 },
  transpilePackages: ['@rakuxon/ui', '@rakuxon/auth', '@rakuxon/api-client', '@rakuxon/contract', '@rakuxon/config'],
};

export default nextConfig;
