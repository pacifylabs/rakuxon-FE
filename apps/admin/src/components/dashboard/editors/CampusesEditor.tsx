'use client';

import type { CampusShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

export function CampusesEditor({ values, onChange }: { values: CampusShape[]; onChange: (values: CampusShape[]) => void }) {
  return (
    <RepeatableGroup
      label="Campuses"
      items={values}
      onChange={onChange}
      createBlank={() => ({ name: '', city: '', countryCode: '' })}
      renderRow={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={item.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Campus name"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            value={item.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="City"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            value={item.countryCode}
            onChange={(e) => update({ countryCode: e.target.value.toUpperCase() })}
            placeholder="GB"
            maxLength={2}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </div>
      )}
    />
  );
}
