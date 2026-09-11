'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { AdminApiClient, ApiError } from '@rakuxon/api-client';
import type { AdminLoginRequest, AdminSession } from '@rakuxon/contract';

import {
  adminSessionFromTokens,
  clearAdminSession,
  readAdminSession,
  writeAdminSession,
} from './session-store';
import type { AdminStoredSession } from './session-store';

export interface AdminAuthContextValue {
  admin: AdminSession | null;
  /** False only until the stored session has been read on the client. */
  ready: boolean;
  signIn: (credentials: AdminLoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (...keys: string[]) => boolean;
  /** The same bearer-token-aware client every method here uses internally. */
  apiClient: AdminApiClient;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside <AdminAuthProvider/>.');
  return value;
}

export function useAdminApiClient(): AdminApiClient {
  return useAdminAuth().apiClient;
}

/**
 * Holds the admin session and refreshes it — the app-local mirror of
 * `@rakuxon/auth`'s `AuthProvider`, structured the same way, but pointed at
 * `/admin-auth/*` and carrying `{ admin: { permissions } }` instead of
 * `{ user: { role } }`. Not built on the shared package: admin sessions are a
 * different, incompatible shape from a `users`-table session, and this is
 * the only app that needs one.
 */
export function AdminAuthProvider({ baseUrl, children }: { baseUrl: string; children: ReactNode }) {
  const [session, setSession] = useState<AdminStoredSession | null>(null);
  const [ready, setReady] = useState(false);
  const sessionRef = useRef<AdminStoredSession | null>(null);

  const apply = useCallback((next: AdminStoredSession | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) writeAdminSession(next);
    else clearAdminSession();
  }, []);

  const client = useMemo(
    () => new AdminApiClient({ baseUrl, getAccessToken: () => sessionRef.current?.accessToken }),
    [baseUrl],
  );

  useEffect(() => {
    const stored = readAdminSession();
    sessionRef.current = stored;
    setSession(stored);
    setReady(true);
  }, []);

  /* Rotate ahead of expiry. A failed refresh signs out rather than retrying —
     see AuthProvider's identical comment on why. */
  useEffect(() => {
    if (!session) return undefined;

    const refreshIn = Math.max(0, session.expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(async () => {
      try {
        const tokens = await client.refresh(session.refreshToken);
        apply(adminSessionFromTokens(tokens));
      } catch {
        apply(null);
      }
    }, refreshIn);

    return () => window.clearTimeout(timer);
  }, [session, client, apply]);

  const signIn = useCallback(
    async (credentials: AdminLoginRequest) => {
      apply(adminSessionFromTokens(await client.login(credentials)));
    },
    [client, apply],
  );

  const signOut = useCallback(async () => {
    const current = sessionRef.current;
    apply(null);
    if (current) {
      try {
        await client.logout(current.refreshToken);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
      }
    }
  }, [client, apply]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin: session?.admin ?? null,
      ready,
      signIn,
      signOut,
      hasPermission: (...keys) => (session ? keys.every((key) => session.admin.permissions.includes(key)) : false),
      apiClient: client,
    }),
    [session, ready, signIn, signOut, client],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
