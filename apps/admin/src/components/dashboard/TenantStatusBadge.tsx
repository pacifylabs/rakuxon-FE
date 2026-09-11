import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { StatusBadge } from '@rakuxon/ui';
import type { TenantStatus } from '@rakuxon/contract';

const CONFIG: Record<TenantStatus, { tone: 'neutral' | 'positive' | 'negative'; label: string; icon: typeof Clock }> = {
  pending: { tone: 'neutral', label: 'Pending', icon: Clock },
  active: { tone: 'positive', label: 'Active', icon: CheckCircle2 },
  suspended: { tone: 'negative', label: 'Suspended', icon: XCircle },
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const { tone, label, icon } = CONFIG[status];
  return (
    <StatusBadge tone={tone} icon={icon}>
      {label}
    </StatusBadge>
  );
}
