'use client';

import type { QualityRatingShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

export function QualityRatingsEditor({
  values,
  onChange,
}: {
  values: QualityRatingShape[];
  onChange: (values: QualityRatingShape[]) => void;
}) {
  return (
    <RepeatableGroup
      label="Quality ratings"
      items={values}
      onChange={onChange}
      createBlank={() => ({ scheme: '', level: '', year: new Date().getFullYear() })}
      renderRow={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={item.scheme}
            onChange={(e) => update({ scheme: e.target.value })}
            placeholder="Scheme, e.g. TEF"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            value={item.level}
            onChange={(e) => update({ level: e.target.value })}
            placeholder="Level, e.g. Gold"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            type="number"
            value={item.year}
            onChange={(e) => update({ year: Number(e.target.value) })}
            placeholder="Year"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </div>
      )}
    />
  );
}
