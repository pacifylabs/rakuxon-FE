import type { LucideIcon } from 'lucide-react';

export type StatusBadgeTone = 'neutral' | 'positive';

const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  neutral: 'bg-surface-muted text-text-muted',
  positive: 'bg-primary/15 text-primary',
};

export interface StatusBadgeProps {
  tone?: StatusBadgeTone;
  icon?: LucideIcon;
  children: string;
}

/** A small status pill — draft/submitted, pending/verified, open/closed. */
export function StatusBadge({ tone = 'neutral', icon: Icon, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {Icon && <Icon aria-hidden="true" className="size-3.5" />}
      {children}
    </span>
  );
}
