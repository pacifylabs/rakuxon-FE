'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  options: readonly SelectFieldOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  onChange?: (value: string) => void;
}

/**
 * `<select>`'s equivalent of FormField — same label/hint/error shape and
 * styling, so a form mixing text inputs and a dropdown doesn't visibly
 * disagree about what a field looks like.
 */
export function SelectField({
  label,
  name,
  options,
  placeholder,
  value,
  defaultValue,
  required,
  error,
  hint,
  onChange,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
        }
        className="rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
