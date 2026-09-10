import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  poweredByHeader: false,
  experimental: { cpus: 2 },
  transpilePackages: ['@rakuxon/ui', '@rakuxon/auth', '@rakuxon/api-client', '@rakuxon/contract', '@rakuxon/config'],
};

export default nextConfig;
