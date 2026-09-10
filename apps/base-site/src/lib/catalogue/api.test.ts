import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchInstitutions } from './api';

/**
 * The API is on a tier that stops the instance when nobody is looking, so the
 * first request after a quiet spell is the one that wakes it. These cover the
 * retry that exists for that, and the case it must not apply to.
 */
afterEach(() => vi.unstubAllGlobals());

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

const page = { items: [], total: 0, page: 1, pageCount: 1 };

describe('catalogue client', () => {
  it('retries once when the first attempt times out', async () => {
    // The first request wakes the instance even when it aborts, so the retry
    // usually lands on a live server rather than repeating the same wait.
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }))
      .mockResolvedValueOnce(ok(page));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchInstitutions();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.error).toBeUndefined();
  });

  it('retries a 5xx, which is the shape a waking instance answers with', async () => {
    // Render answers 502 while the container is starting. Treating that as
    // final would make the retry useless for the case it was written for.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
      .mockResolvedValueOnce(ok(page));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchInstitutions();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.error).toBeUndefined();
  });

  it('does not retry a 404, which is an answer rather than a failure to answer', async () => {
    // Retrying wastes the visitor's time and ends in the same 404.
    const fetchMock = vi.fn(async () => ({ ok: false, status: 404 }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchInstitutions();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).toBeTruthy();
  });

  it('still fails soft when both attempts fail', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('down');
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchInstitutions();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});
