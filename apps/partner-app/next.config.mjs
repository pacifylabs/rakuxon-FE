/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rakuxon/ui', '@rakuxon/auth', '@rakuxon/api-client', '@rakuxon/contract', '@rakuxon/config'],
};

export default nextConfig;
