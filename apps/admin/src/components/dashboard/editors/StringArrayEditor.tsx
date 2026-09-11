'use client';

import { Plus, X } from 'lucide-react';

export interface StringArrayEditorProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

/**
 * Add/remove/edit a flat list of strings — reused for every plain
 * string-array column across institutions, courses and articles (aka,
 * highlights, memberships, disciplines, tags). Each row is its own text
 * input rather than one comma-separated field, so a value containing a comma
 * (an institution name, say) is never misparsed.
 */
export function StringArrayEditor({ label, values, onChange, placeholder }: StringArrayEditorProps) {
  function updateAt(index: number, value: string) {
    onChange(values.map((existing, i) => (i === index ? value : existing)));
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-text">{label}</legend>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(event) => updateAt(index, event.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
            />
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
        onClick={() => onChange([...values, ''])}
        className="mt-2 flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add {label.toLowerCase()}
      </button>
    </fieldset>
  );
}
