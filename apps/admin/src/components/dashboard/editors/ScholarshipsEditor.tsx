'use client';

import type { ScholarshipShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

export function ScholarshipsEditor({
  values,
  onChange,
}: {
  values: ScholarshipShape[];
  onChange: (values: ScholarshipShape[]) => void;
}) {
  return (
    <RepeatableGroup<ScholarshipShape>
      label="Scholarships"
      items={values}
      onChange={onChange}
      createBlank={() => ({ name: '' })}
      renderRow={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={item.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Name"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring sm:col-span-2"
          />
          <input
            type="number"
            value={item.amount ?? ''}
            onChange={(e) => update({ amount: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Amount"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <input
            value={item.currency ?? ''}
            onChange={(e) => update({ currency: e.target.value.toUpperCase() || undefined })}
            placeholder="GBP"
            maxLength={3}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </div>
      )}
    />
  );
}
