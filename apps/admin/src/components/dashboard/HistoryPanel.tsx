'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiError, NetworkError } from '@rakuxon/api-client';
import { formatDateTime } from '@rakuxon/ui';
import type { AuditLogEntry, ResourceAuditLog } from '@rakuxon/contract';

const ACTOR_LABEL: Record<AuditLogEntry['actorType'], string> = {
  admin: 'Admin',
  student: 'Student',
  system: 'System',
};

/**
 * One resource's own trail — reused across application/student/tenant/admin
 * detail screens, each passing its own loader since the read endpoint
 * differs per resource but the rendering never does.
 */
export function HistoryPanel({ load }: { load: () => Promise<ResourceAuditLog> }) {
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doLoad = useCallback(async () => {
    try {
      setEntries((await load()).items);
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof NetworkError
          ? caught.message
          : 'Could not load the history. Please try again.',
      );
    }
  }, [load]);

  useEffect(() => {
    void doLoad();
  }, [doLoad]);

  return (
    <div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {!entries && !error && (
        <p role="status" className="text-sm text-text-muted">
          Loading…
        </p>
      )}

      {entries && entries.length === 0 && (
        <p className="text-sm text-text-muted">Nothing has happened here yet.</p>
      )}

      {entries && entries.length > 0 && (
        <ol className="flex flex-col gap-4 border-l border-border pl-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <p className="text-sm text-text">
                <span className="font-semibold">
                  {entry.actorName ?? ACTOR_LABEL[entry.actorType]}
                </span>{' '}
                {entry.description}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {ACTOR_LABEL[entry.actorType]} · {formatDateTime(entry.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
