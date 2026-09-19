import clsx from 'clsx';

export interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  /** Accessible name — a Switch has no visible label of its own. */
  label: string;
  className?: string;
}

/**
 * A binary on/off control, for settings that are a flag rather than a
 * destructive action (compare `Button` for "Suspend"/"Reactivate", which read
 * as actions, not state). `role="switch"` on a real `<button>` rather than a
 * styled checkbox input, so it needs no extra wiring to be keyboard- and
 * screen-reader-operable.
 */
export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={clsx(
        'inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent p-1 transition-colors duration-fast ease-standard',
        'focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'motion-reduce:transition-none',
        checked ? 'bg-primary' : 'bg-border',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          'size-4 transform rounded-full bg-surface shadow-sm transition-transform duration-fast ease-standard motion-reduce:transition-none',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}
