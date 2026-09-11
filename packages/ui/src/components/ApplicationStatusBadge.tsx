import { CheckCircle2, FileClock } from 'lucide-react';

import { StatusBadge } from './StatusBadge';

/**
 * Maps an application's status to the shared StatusBadge — one place, so a
 * student's dashboard and the admin oversight list agree on what "draft" and
 * "submitted" look like. A pure presentational mapping with no app-specific
 * logic, which is what makes it safe to share across apps that cannot import
 * from one another's local `src/components`.
 */
export function ApplicationStatusBadge({ status }: { status: 'draft' | 'submitted' }) {
  const submitted = status === 'submitted';
  return (
    <StatusBadge tone={submitted ? 'positive' : 'neutral'} icon={submitted ? CheckCircle2 : FileClock}>
      {submitted ? 'Submitted' : 'Draft'}
    </StatusBadge>
  );
}
