import { describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiError, NetworkError } from './index';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function clientWith(fetchImpl: typeof fetch, token?: string) {
  return new ApiClient({
    baseUrl: 'https://api.test/',
    getAccessToken: () => token ?? null,
    fetchImpl,
  });
}

describe('ApiClient', () => {
  it('trims a trailing slash so paths do not double up', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, { status: 'ok' }));
    await clientWith(fetchImpl as unknown as typeof fetch).health();
    expect(fetchImpl).toHaveBeenCalledWith('https://api.test/v1/health', expect.anything());
  });

  it('sends no authorization header on a public call', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, {}));
    await clientWith(fetchImpl as unknown as typeof fetch, 'tok').login({
      email: 'a@b.test',
      password: 'x',
    });
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit & { headers: Record<string, string> };
    expect(init.headers.authorization).toBeUndefined();
  });

  it('sends the bearer token on an authenticated call', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, {}));
    await clientWith(fetchImpl as unknown as typeof fetch, 'tok-123').me();
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit & { headers: Record<string, string> };
    expect(init.headers.authorization).toBe('Bearer tok-123');
  });

  it('omits the header when signed out rather than sending "Bearer null"', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, {}));
    await clientWith(fetchImpl as unknown as typeof fetch).me();
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit & { headers: Record<string, string> };
    expect(init.headers.authorization).toBeUndefined();
  });

  it('never sends a tenant, because the API derives it server-side', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(200, {}));
    await clientWith(fetchImpl as unknown as typeof fetch, 'tok').issueOnboardingLink({
      inviteeEmail: 'student@example.com',
    });
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit & { headers: Record<string, string> };
    expect(init.body).not.toContain('tenant');
  });

  it('returns undefined for 204 rather than trying to parse a body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    await expect(
      clientWith(fetchImpl as unknown as typeof fetch).logout('r'),
    ).resolves.toBeUndefined();
  });

  it('raises ApiError with the status and the server message', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(json(401, { message: 'Those credentials are not valid.' }));

    await expect(
      clientWith(fetchImpl as unknown as typeof fetch).login({ email: 'a@b.test', password: 'x' }),
    ).rejects.toMatchObject({ status: 401, message: 'Those credentials are not valid.' });
  });

  it('flattens the array of messages a validation failure returns', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(json(400, { message: ['too short', 'not an email'] }));

    await expect(
      clientWith(fetchImpl as unknown as typeof fetch).login({ email: 'x', password: 'y' }),
    ).rejects.toThrow('too short, not an email');
  });

  it('classifies statuses so callers do not compare numbers', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json(409, { message: 'taken' }));
    try {
      await clientWith(fetchImpl as unknown as typeof fetch).registerAgency({
        agencyName: 'A',
        slug: 'a',
        email: 'a@b.test',
        firstName: 'A',
        lastName: 'B',
        password: 'x'.repeat(12),
      });
      throw new Error('expected a rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).isConflict).toBe(true);
      expect((error as ApiError).isUnauthorized).toBe(false);
    }
  });

  it('distinguishes never-arrived from arrived-and-refused', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(clientWith(fetchImpl as unknown as typeof fetch).health()).rejects.toBeInstanceOf(
      NetworkError,
    );
  });

  it('survives a non-JSON error body instead of throwing while parsing', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 502 }));
    await expect(clientWith(fetchImpl as unknown as typeof fetch).health()).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502.',
    });
  });
});
