import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Usually a single link or button. */
  action?: ReactNode;
}

/**
 * "Nothing here yet" done properly: an icon, a warm one-liner, and a way
 * forward — not a bare sentence. Anywhere a list can legitimately be empty
 * (applications, documents, a future messages or offers screen) reaches for
 * this instead of reinventing its own placeholder text.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface px-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-primary">
        <Icon aria-hidden="true" className="size-8" />
      </span>
      <div>
        <p className="font-heading text-base font-semibold text-text">{title}</p>
        <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
