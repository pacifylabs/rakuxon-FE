import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineWorkspace } from 'vitest/config';

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

/** Aliases every app and package share. */
const shared = {
  '@rakuxon/ui/theme': resolvePath('./packages/ui/src/theme/index.ts'),
  '@rakuxon/ui': resolvePath('./packages/ui/src/index.ts'),
  '@rakuxon/config': resolvePath('./packages/config/src/index.ts'),
  '@rakuxon/contract': resolvePath('./packages/contract/src/index.ts'),
  '@rakuxon/api-client': resolvePath('./packages/api-client/src/index.ts'),
  '@rakuxon/auth': resolvePath('./packages/auth/src/index.ts'),
};

const base = {
  environment: 'jsdom' as const,
  globals: false,
  setupFiles: [resolvePath('./vitest.setup.ts')],
  restoreMocks: true,
};

/*
 * One project per app, because each resolves "@" to its own src. A single
 * config cannot: the alias is global, so base-site and partner-app would
 * fight over it and one of them would import the other's components.
 */
export default defineWorkspace([
  {
    plugins: [react()],
    resolve: { alias: shared },
    test: { ...base, name: 'packages', include: ['packages/*/src/**/*.test.{ts,tsx}'] },
  },
  {
    plugins: [react()],
    resolve: { alias: { ...shared, '@': resolvePath('./apps/base-site/src') } },
    test: { ...base, name: 'base-site', include: ['apps/base-site/src/**/*.test.{ts,tsx}'] },
  },
  ...['partner-app', 'institution-portal', 'admin'].map((app) => ({
    plugins: [react()],
    resolve: { alias: { ...shared, '@': resolvePath(`./apps/${app}/src`) } },
    test: { ...base, name: app, include: [`apps/${app}/src/**/*.test.{ts,tsx}`] },
  })),
]);
