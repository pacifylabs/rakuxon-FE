import type { AdminAuthTokens, AdminSession } from '@rakuxon/contract';

export interface AdminStoredSession {
  accessToken: string;
  refreshToken: string;
  admin: AdminSession;
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
}

/*
 * A distinct key from `@rakuxon/auth`'s `rakuxon.session` — defense in
 * depth: apps/admin is already origin-isolated from every other app in dev,
 * but a distinct key means the two session stores can never collide even if
 * that ever changes.
 */
const STORAGE_KEY = 'rakuxon.admin.session';

/** sessionStorage, not localStorage — see `@rakuxon/auth`'s session-store for why. */
export function readAdminSession(storage: Storage | undefined = safeStorage()): AdminStoredSession | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AdminStoredSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.admin) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function writeAdminSession(
  session: AdminStoredSession,
  storage: Storage | undefined = safeStorage(),
): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* Storage unavailable: the session stays in memory for this page only. */
  }
}

export function clearAdminSession(storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to do — there was nothing to clear. */
  }
}

export function adminSessionFromTokens(tokens: AdminAuthTokens, now = Date.now()): AdminStoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    admin: tokens.admin,
    expiresAt: now + tokens.expiresIn * 1000,
  };
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
