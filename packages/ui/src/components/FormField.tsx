'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  defaultValue?: string;
  /** Example text shown in the empty control, not a substitute for `label`. */
  placeholder?: string;
  /**
   * For a screen that tracks field values as state (a multi-section form
   * with a completeness indicator, a dynamic list) rather than reading
   * `FormData` on submit. The field stays uncontrolled — `defaultValue` sets
   * the initial value, this just observes changes — so it is additive to
   * every existing FormData-based form rather than a second way to do them.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Label, control and error as one unit.
 *
 * The error is linked with aria-describedby and the control is marked
 * aria-invalid, so a screen reader hears the problem when it lands on the
 * field rather than only seeing red text next to it.
 *
 * `type="password"` gets a reveal toggle for free — every password field in
 * the product goes through this component, so the toggle only has to exist
 * once rather than being reimplemented per screen.
 */
export function FormField({
  label,
  name,
  type = 'text',
  autoComplete,
  required,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? 'text' : type}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
          }
          className={`w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 ${
            isPassword ? 'pr-12' : ''
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
          >
            {revealed ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
          </button>
        )}
      </div>

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
