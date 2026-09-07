import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearSession,
  isExpired,
  readSession,
  sessionFromTokens,
  writeSession,
} from './session-store';
import type { Session } from './session-store';

const tokens = {
  accessToken: 'access',
  refreshToken: 'refresh',
  expiresIn: 900,
  user: {
    id: 'u1',
    email: 'a@b.test',
    fullName: 'Ada',
    role: 'agency_admin',
    tenantId: 't1',
  },
} as Parameters<typeof sessionFromTokens>[0];

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  } as Storage;
};

/** Every accessor throws — a private window, or storage blocked by policy. */
const hostileStorage = (): Storage =>
  ({
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  }) as unknown as Storage;

describe('sessionFromTokens', () => {
  it('converts the relative lifetime into an absolute expiry', () => {
    const session = sessionFromTokens(tokens, 1_000_000);
    expect(session.expiresAt).toBe(1_000_000 + 900_000);
    expect(session.user.role).toBe('agency_admin');
  });
});

describe('session storage', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = memoryStorage();
  });

  it('round-trips a session', () => {
    const session = sessionFromTokens(tokens);
    writeSession(session, storage);
    expect(readSession(storage)).toEqual(session);
  });

  it('reads null when nothing is stored', () => {
    expect(readSession(storage)).toBeNull();
  });

  it('clears', () => {
    writeSession(sessionFromTokens(tokens), storage);
    clearSession(storage);
    expect(readSession(storage)).toBeNull();
  });

  it('treats corrupt stored data as signed out rather than throwing', () => {
    storage.setItem('rakuxon.session', '{not json');
    expect(readSession(storage)).toBeNull();
  });

  it('rejects a stored object missing its tokens', () => {
    storage.setItem('rakuxon.session', JSON.stringify({ user: { id: 'u1' } }));
    expect(readSession(storage)).toBeNull();
  });

  it('survives storage that throws on every access', () => {
    const hostile = hostileStorage();
    expect(() => writeSession(sessionFromTokens(tokens), hostile)).not.toThrow();
    expect(readSession(hostile)).toBeNull();
    expect(() => clearSession(hostile)).not.toThrow();
  });

  it('survives storage being absent entirely, as on the server', () => {
    expect(readSession(undefined)).toBeNull();
    expect(() => writeSession(sessionFromTokens(tokens), undefined)).not.toThrow();
  });
});

describe('isExpired', () => {
  const session = (expiresAt: number) => ({ expiresAt }) as Session;

  it('is false well before expiry', () => {
    expect(isExpired(session(2_000_000), 30, 1_000_000)).toBe(false);
  });

  it('is true after expiry', () => {
    expect(isExpired(session(1_000_000), 30, 2_000_000)).toBe(true);
  });

  it('treats a token expiring within the skew as already gone', () => {
    // 10s left, 30s skew: a request would land after it expired.
    expect(isExpired(session(1_010_000), 30, 1_000_000)).toBe(true);
  });

  it('honours a custom skew', () => {
    expect(isExpired(session(1_010_000), 5, 1_000_000)).toBe(false);
  });
});
