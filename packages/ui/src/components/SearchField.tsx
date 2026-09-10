'use client';

import clsx from 'clsx';
import { Search } from 'lucide-react';
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string;
  /** Keeps the label for screen readers but hides it visually — for a compact bar where the placeholder already says what the field is. */
  hideLabel?: boolean;
  /** Rendered inside the same bordered box as the input, at its right edge — a submit button, most often. */
  trailing?: ReactNode;
  /** Rendered below the input, inside the same positioning context — a typeahead listbox, most often. */
  children?: ReactNode;
  inputClassName?: string;
}

/**
 * The one search input every search bar on the site now shares — a
 * magnifying-glass icon inside the field itself, rather than a separate
 * button doing that job, or three near-identical inputs (hero, explore,
 * universities) each styled a little differently. One component, one look,
 * at every screen size — no breakpoint has to redraw it.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label, hideLabel, trailing, children, inputClassName, id: idProp, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-sm font-medium text-text'}>
        {label}
      </label>

      <div className="relative">
        <Search
          aria-hidden="true"
          focusable="false"
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          ref={ref}
          id={id}
          type="search"
          className={clsx(
            'w-full rounded-md border border-border bg-surface py-3 pl-12 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2',
            trailing ? 'pr-12' : 'pr-4',
            inputClassName,
          )}
          {...rest}
        />

        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>
        )}

        {children}
      </div>
    </div>
  );
});
