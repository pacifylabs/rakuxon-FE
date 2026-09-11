'use client';

import type { RequirementGroupShape, RequirementItemShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

export function RequirementGroupsEditor({
  values,
  onChange,
}: {
  values: RequirementGroupShape[];
  onChange: (values: RequirementGroupShape[]) => void;
}) {
  return (
    <RepeatableGroup
      label="Entry requirements"
      items={values}
      onChange={onChange}
      createBlank={() => ({ id: crypto.randomUUID(), label: '', items: [] })}
      renderRow={(group, update) => (
        <div className="flex flex-col gap-3">
          <input
            value={group.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Group label, e.g. Academic"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />

          <div className="pl-4">
            <RepeatableGroup<RequirementItemShape>
              label="Requirements in this group"
              items={group.items}
              onChange={(items) => update({ items })}
              createBlank={() => ({ name: '' })}
              renderRow={(item, updateItem) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem({ name: e.target.value })}
                    placeholder="Requirement, e.g. Transcript"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring sm:col-span-2"
                  />
                  <input
                    type="number"
                    value={item.minPercentage ?? ''}
                    onChange={(e) => updateItem({ minPercentage: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Min %"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}
    />
  );
}
