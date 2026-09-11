'use client';

import { Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface RepeatableGroupProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createBlank: () => T;
  /** Renders one row's fields; call `update` with a partial patch on change. */
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}

/**
 * The add/remove/edit chrome shared by every jsonb-array editor
 * (campuses, requiredDocuments, englishTests, faqs, qualityRatings,
 * scholarships, intakes) — written once here, so each shape-specific editor
 * only has to describe its own fields via `renderRow`.
 */
export function RepeatableGroup<T>({ label, items, onChange, createBlank, renderRow }: RepeatableGroupProps<T>) {
  function updateAt(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-text">{label}</legend>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex-1">{renderRow(item, (patch) => updateAt(index, patch), index)}</div>
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove ${label} entry ${index + 1}`}
              className="grid size-9 shrink-0 place-items-center rounded-md text-text-muted hover:bg-surface-muted hover:text-danger"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, createBlank()])}
        className="mt-3 flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add {label.toLowerCase()}
      </button>
    </fieldset>
  );
}
