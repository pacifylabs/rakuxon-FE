'use client';

import { AuthProvider } from '@rakuxon/auth';
import type { ReactNode } from 'react';

/**
 * Binds the session to this deployment's API.
 *
 * Read at module scope from a NEXT_PUBLIC_ variable, which Next inlines at
 * build time. `packages/config` validates it, but a missing value must not
 * blank the whole app, so it falls back to the local API.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export function SessionProvider({ children }: { children: ReactNode }) {
  return <AuthProvider baseUrl={API_BASE_URL}>{children}</AuthProvider>;
}
