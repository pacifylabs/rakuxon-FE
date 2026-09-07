import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rakuxon/ui/theme': resolvePath('./packages/ui/src/theme/index.ts'),
      '@rakuxon/ui': resolvePath('./packages/ui/src/index.ts'),
      '@rakuxon/config': resolvePath('./packages/config/src/index.ts'),
      '@rakuxon/contract': resolvePath('./packages/contract/src/index.ts'),
      '@rakuxon/api-client': resolvePath('./packages/api-client/src/index.ts'),
      '@rakuxon/auth': resolvePath('./packages/auth/src/index.ts'),
      '@': resolvePath('./apps/base-site/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: [resolvePath('./vitest.setup.ts')],
    include: ['packages/*/src/**/*.test.{ts,tsx}', 'apps/*/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    restoreMocks: true,
  },
});
