import { CheckCircle2, FileClock } from 'lucide-react';

import { StatusBadge } from '@rakuxon/ui';
import type { Application } from '@rakuxon/contract';

/** Maps an application's status to the shared StatusBadge — one place, both list and detail agree. */
export function ApplicationStatusBadge({ status }: { status: Application['status'] }) {
  const submitted = status === 'submitted';
  return (
    <StatusBadge tone={submitted ? 'positive' : 'neutral'} icon={submitted ? CheckCircle2 : FileClock}>
      {submitted ? 'Submitted' : 'Draft'}
    </StatusBadge>
  );
}
