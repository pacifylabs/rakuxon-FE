'use client';

import type { IntakeShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

const STATUSES: IntakeShape['status'][] = ['open', 'closing_soon', 'closed'];

export function IntakesEditor({ values, onChange }: { values: IntakeShape[]; onChange: (values: IntakeShape[]) => void }) {
  return (
    <RepeatableGroup
      label="Intakes"
      items={values}
      onChange={onChange}
      createBlank={() => ({ month: 'Sep', year: new Date().getFullYear(), status: 'open' as const })}
      renderRow={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={item.month}
            onChange={(e) => update({ month: e.target.value })}
            placeholder="Month, e.g. Sep"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            type="number"
            value={item.year}
            onChange={(e) => update({ year: Number(e.target.value) })}
            placeholder="Year"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            type="date"
            value={item.applicationDeadline ?? ''}
            onChange={(e) => update({ applicationDeadline: e.target.value || undefined })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <select
            value={item.status}
            onChange={(e) => update({ status: e.target.value as IntakeShape['status'] })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      )}
    />
  );
}
