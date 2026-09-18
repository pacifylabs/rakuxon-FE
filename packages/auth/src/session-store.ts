import type { AuthTokens, AuthUser } from '@rakuxon/contract';

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
}

export const STORAGE_KEY = 'rakuxon.session';
const MIGRATED_KEY = 'rakuxon.session.migrated';

/**
 * Where the session lives.
 *
 * localStorage shares the session with email links opened in another tab.
 * Tokens remain scoped to this origin; logout clears the shared session.
 * Refreshes are serialized with Web Locks in AuthProvider.
 *
 * Every accessor tolerates storage being unavailable. Private windows, cleared
 * site data and browsers configured to block storage all throw on access, and
 * a thrown storage read must not take the whole app down.
 */
export function readSession(storage: Storage | undefined = safeStorage()): Session | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: Session, storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(session));
    storage?.setItem(MIGRATED_KEY, 'true');
  } catch {
    /* Storage unavailable: the session stays in memory for this page only. */
  }
}

export function clearSession(storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
    storage?.setItem(MIGRATED_KEY, 'true');
  } catch {
    /* Nothing to do — there was nothing to clear. */
  }
}

/** Turns an API token payload into a stored session. */
export function sessionFromTokens(tokens: AuthTokens, now = Date.now()): Session {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: tokens.user,
    expiresAt: now + tokens.expiresIn * 1000,
  };
}

/**
 * True when the access token is spent or close enough that a request would
 * likely land after it expires. The skew covers clock drift and flight time.
 */
export function isExpired(session: Session, skewSeconds = 30, now = Date.now()): boolean {
  return session.expiresAt - skewSeconds * 1000 <= now;
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** Move an existing tab's session once; never overwrite a newer shared session. */
export function migrateTabSession(): void {
  try {
    if (!readSession() && !window.localStorage.getItem(MIGRATED_KEY) && window.sessionStorage.getItem(STORAGE_KEY)) {
      const legacy = readSession(window.sessionStorage);
      if (legacy) writeSession(legacy);
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* Storage may be unavailable. */ }
}
