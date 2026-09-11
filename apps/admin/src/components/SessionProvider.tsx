'use client';

import type { ReactNode } from 'react';

import { AdminAuthProvider } from '@/lib/admin-auth';

/**
 * Binds the admin session to this deployment's API.
 *
 * `AdminAuthProvider` is app-local, not `@rakuxon/auth`: admin sessions are a
 * fully separate identity system on the backend (own table, own tokens), so
 * this app does not share the `users`-table auth provider the other apps use.
 *
 * Read at module scope from a NEXT_PUBLIC_ variable, which Next inlines at
 * build time. `packages/config` validates it, but a missing value must not
 * blank the whole app, so it falls back to the local API.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export function SessionProvider({ children }: { children: ReactNode }) {
  return <AdminAuthProvider baseUrl={API_BASE_URL}>{children}</AdminAuthProvider>;
}
