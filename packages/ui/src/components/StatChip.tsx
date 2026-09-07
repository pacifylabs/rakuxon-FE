import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { CountUp } from './CountUp';
import { CountryFlag } from './CountryFlag';
import { IconBubble } from './IconBubble';
import type { IconBubbleTone } from './IconBubble';

export interface StatChipProps {
  /** Optional once `countryCode` is given — a flag says more than a glyph. */
  icon?: LucideIcon;
  /**
   * ISO-2. Replaces the icon with the country's flag, which is the right mark
   * for a per-country figure: six identical building glyphs down a list tell
   * the reader nothing the label has not already said.
   */
  countryCode?: string;
  tone?: IconBubbleTone;
  /** Pre-formatted figure, e.g. "100,000+". */
  value: string;
  label: string;
  /**
   * Marks the figure as illustrative rather than measured (docs/04b § 3.4).
   * Adds `data-sample` and an assistive-technology note.
   */
  sample?: boolean;
  /** Counts the figure up from zero when it scrolls into view. */
  animate?: boolean;
  className?: string;
}

/** Coloured icon chip + big number + label, for the stat bar (docs/04b § 3.4). */
export function StatChip({
  icon,
  countryCode,
  tone = 'tone1',
  value,
  label,
  sample = false,
  animate = false,
  className,
}: StatChipProps) {
  return (
    <div
      data-sample={sample ? 'true' : undefined}
      className={clsx('flex items-center gap-4', className)}
    >
      {countryCode ? (
        <CountryFlag countryCode={countryCode} size="lg" />
      ) : (
        icon && <IconBubble icon={icon} tone={tone} size="lg" />
      )}
      <div className="min-w-0">
        <p className="font-heading text-2xl font-bold text-text">
          {animate ? <CountUp value={value} /> : value}
        </p>
        <p className="text-sm text-text-muted">
          {label}
          {sample && <span className="sr-only"> (sample data)</span>}
        </p>
      </div>
    </div>
  );
}
