import { SectionBand, StatChip } from '@rakuxon/ui';

import { STATS } from '@/content/home';

/**
 * docs/04b § 3.4 — four stats with coloured icon chips.
 * Every figure is illustrative until we have measured data, so each chip
 * carries `sample`.
 */
export function StatBar() {
  return (
    <SectionBand tone="muted" labelledBy="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        Rakuxon by the numbers
      </h2>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <li key={stat.label}>
            <StatChip
              icon={stat.icon}
              tone={stat.tone}
              value={stat.value}
              label={stat.label}
              sample
              animate
            />
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
