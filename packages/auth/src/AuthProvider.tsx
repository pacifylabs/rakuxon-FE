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

import { ApiClient, ApiError } from '@rakuxon/api-client';
import type {
  AuthUser,
  LoginRequest,
  RegisterAgencyRequest,
  RegisterStudentRequest,
  RegisterViaOnboardingLinkRequest,
  Role,
} from '@rakuxon/contract';

import {
  clearSession,
  isExpired,
  readSession,
  sessionFromTokens,
  writeSession,
} from './session-store';
import type { Session } from './session-store';

export interface AuthContextValue {
  user: AuthUser | null;
  /** False only until the stored session has been read on the client. */
  ready: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  registerAgency: (input: RegisterAgencyRequest) => Promise<void>;
  registerStudent: (input: RegisterStudentRequest) => Promise<void>;
  registerViaOnboardingLink: (input: RegisterViaOnboardingLinkRequest) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  /**
   * The client every auth method already routes through, for a screen that
   * needs an authenticated call this context has no dedicated method for
   * (profile, documents, applications) — one bearer-token-aware client per
   * app, not one hand-instantiated per page.
   */
  apiClient: ApiClient;
}

/** Exported so a guard's not-ready branch can be exercised directly. */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider/>.');
  return value;
}

/** The same bearer-token-aware client every auth method uses internally. */
export function useApiClient(): ApiClient {
  return useAuth().apiClient;
}

/**
 * Holds the session and refreshes it.
 *
 * The session lives in state as well as storage so a sign-in re-renders; the
 * ref is what the API client reads, because a client built once must still see
 * the newest token without being rebuilt on every render.
 *
 * `ready` exists so a guard can tell "signed out" from "not looked yet".
 * Without it every protected page flashes a redirect on first paint, because
 * the server render has no storage to read.
 */
export function AuthProvider({ baseUrl, children }: { baseUrl: string; children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const sessionRef = useRef<Session | null>(null);

  const apply = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) writeSession(next);
    else clearSession();
  }, []);

  const client = useMemo(
    () => new ApiClient({ baseUrl, getAccessToken: () => sessionRef.current?.accessToken }),
    [baseUrl],
  );

  /* Storage only exists on the client, so the first read happens after mount. */
  useEffect(() => {
    const stored = readSession();
    sessionRef.current = stored;
    setSession(stored);
    setReady(true);
  }, []);

  /*
   * Rotate ahead of expiry. A failed refresh signs out rather than retrying:
   * the backend revokes a whole token family when it sees a replay, so
   * hammering it would turn one bad refresh into a locked-out user.
   */
  useEffect(() => {
    if (!session) return undefined;

    const refreshIn = Math.max(0, session.expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(async () => {
      try {
        const tokens = await client.refresh(session.refreshToken);
        apply(sessionFromTokens(tokens));
      } catch {
        apply(null);
      }
    }, refreshIn);

    return () => window.clearTimeout(timer);
  }, [session, client, apply]);

  const signIn = useCallback(
    async (credentials: LoginRequest) => {
      apply(sessionFromTokens(await client.login(credentials)));
    },
    [client, apply],
  );

  const registerAgency = useCallback(
    async (input: RegisterAgencyRequest) => {
      apply(sessionFromTokens(await client.registerAgency(input)));
    },
    [client, apply],
  );

  const registerStudent = useCallback(
    async (input: RegisterStudentRequest) => {
      apply(sessionFromTokens(await client.registerStudent(input)));
    },
    [client, apply],
  );

  const registerViaOnboardingLink = useCallback(
    async (input: RegisterViaOnboardingLinkRequest) => {
      apply(sessionFromTokens(await client.registerViaOnboardingLink(input)));
    },
    [client, apply],
  );

  const signOut = useCallback(async () => {
    const current = sessionRef.current;
    /* Clear locally first: the user asked to leave, and a failing network call
       must not keep them signed in. */
    apply(null);
    if (current) {
      try {
        await client.logout(current.refreshToken);
      } catch (error) {
        /* Already-invalid tokens are the normal case here, not a problem. */
        if (!(error instanceof ApiError)) throw error;
      }
    }
  }, [client, apply]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session && !isExpired(session, 0) ? session.user : (session?.user ?? null),
      ready,
      signIn,
      registerAgency,
      registerStudent,
      registerViaOnboardingLink,
      signOut,
      hasRole: (...roles) => (session ? roles.includes(session.user.role as Role) : false),
      apiClient: client,
    }),
    [
      session,
      ready,
      signIn,
      registerAgency,
      registerStudent,
      registerViaOnboardingLink,
      signOut,
      client,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
