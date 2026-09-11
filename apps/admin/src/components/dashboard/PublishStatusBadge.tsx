import { CheckCircle2, FileEdit, XCircle } from 'lucide-react';

import { StatusBadge } from '@rakuxon/ui';
import type { PublishStatus } from '@rakuxon/contract';

const CONFIG: Record<PublishStatus, { tone: 'neutral' | 'positive' | 'negative'; label: string; icon: typeof FileEdit }> = {
  draft: { tone: 'neutral', label: 'Draft', icon: FileEdit },
  published: { tone: 'positive', label: 'Published', icon: CheckCircle2 },
  suspended: { tone: 'negative', label: 'Suspended', icon: XCircle },
};

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  const { tone, label, icon } = CONFIG[status];
  return (
    <StatusBadge tone={tone} icon={icon}>
      {label}
    </StatusBadge>
  );
}
