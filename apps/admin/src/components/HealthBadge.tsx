'use client';

import { useEffect, useState } from 'react';

import { ApiClient } from '@rakuxon/api-client';

type Status = 'checking' | 'ok' | 'degraded' | 'unreachable';

const LABELS: Record<Status, string> = {
  checking: 'API: checking…',
  ok: 'API: ok',
  degraded: 'API: degraded',
  unreachable: 'API: unreachable',
};

const TONES: Record<Status, string> = {
  checking: 'border-border text-text-muted',
  ok: 'border-success text-text',
  degraded: 'border-warning text-text',
  unreachable: 'border-danger text-text',
};

/**
 * The FE stage 0 gate: one app reaches the API's /health.
 *
 * Distinguishes three failures that matter operationally — reachable and
 * healthy, reachable but its database is down, and not reachable at all. A
 * single red dot would hide which.
 */
export function HealthBadge({ baseUrl }: { baseUrl: string }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const health = await new ApiClient({ baseUrl }).health();
        setStatus(health.dependencies.database === 'up' ? 'ok' : 'degraded');
      } catch {
        setStatus('unreachable');
      }
    })();

    return () => controller.abort();
  }, [baseUrl]);

  return (
    <span
      role="status"
      data-status={status}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${TONES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
