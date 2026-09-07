import type { AuthTokens, AuthUser } from '@rakuxon/contract';

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
}

const STORAGE_KEY = 'rakuxon.session';

/**
 * Where the session lives.
 *
 * sessionStorage, not localStorage: the token is gone when the tab closes,
 * which meaningfully narrows the window for a stolen token on a shared
 * machine. Neither is proof against XSS — the real mitigation is httpOnly
 * cookies, which needs the API to set them and is a deliberate later change.
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
  } catch {
    /* Storage unavailable: the session stays in memory for this page only. */
  }
}

export function clearSession(storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
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
    return typeof window === 'undefined' ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
