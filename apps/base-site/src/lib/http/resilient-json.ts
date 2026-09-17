/**
 * A resilient JSON GET, for any backend endpoint that has to fail soft on a
 * marketing page: an empty section beats a broken page.
 *
 * Same two-tier timeout as `lib/catalogue/api.ts`'s `getJson` (see that
 * file's own comment for why) — a short first attempt, then a longer one.
 * The API is on Render's free tier and sleeps after fifteen minutes idle; the
 * first request is what wakes it, so the retry usually lands on a live
 * server rather than repeating the same wait. A 4xx is not retried — that is
 * an answer, not a failure to answer.
 */
export interface ResilientFetcherOptions {
  /** Origin plus any path prefix, e.g. `https://api.example.com/v1/testimonials`. */
  baseUrl: string;
  /** Short first attempt, in ms. */
  timeoutMs?: number;
  /** Longer retry, in ms. */
  retryTimeoutMs?: number;
  /** Prefixes the console.error on failure, e.g. `[testimonials]`. */
  logLabel: string;
}

export function createResilientJsonFetcher({
  baseUrl,
  timeoutMs = 6_000,
  retryTimeoutMs = 25_000,
  logLabel,
}: ResilientFetcherOptions) {
  function reportFailure(path: string, error: unknown): void {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`${logLabel} ${path} failed: ${reason}`);
  }

  async function attempt<T>(path: string, revalidate: number, timeout: number): Promise<T> {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        signal: abort.signal,
        next: { revalidate },
        headers: { accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Responded ${response.status}`);
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  async function getJson<T>(path: string, revalidate: number): Promise<T> {
    try {
      return await attempt<T>(path, revalidate, timeoutMs);
    } catch (error) {
      if (error instanceof Error && /responded 4\d\d/i.test(error.message)) throw error;
      return attempt<T>(path, revalidate, retryTimeoutMs);
    }
  }

  return { getJson, reportFailure };
}
