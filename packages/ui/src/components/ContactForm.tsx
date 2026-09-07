'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

export interface ContactFormProps {
  /** Pre-selects the role, e.g. from /contact?intent=signup. */
  defaultRole?: string;
  /** Shown in the fallback notice, since nothing is wired to a backend yet. */
  fallbackEmail: string;
  /**
   * What the visitor was looking at when they pressed apply.
   *
   * Rendered as a visible summary and carried in a hidden field, so the
   * selection survives the step rather than being something they have to
   * describe again from memory.
   */
  selection?: { label: string; href: string; value: string } | null;
  /** Seeds the message box, e.g. with the course being applied for. */
  defaultMessage?: string;
  className?: string;
}

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'agency', label: 'Agency or recruitment partner' },
  { value: 'institution', label: 'Institution or university' },
] as const;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/**
 * Contact / intake form (docs/04b § 10).
 *
 * 04b says this posts to the BE contact endpoint — that endpoint does not
 * exist yet, so the form validates fully and then tells the truth rather than
 * pretending to have sent something. Swap `onSubmit` for the real call when
 * the BE lands; the validation and markup do not change.
 */
export function ContactForm({
  defaultRole = 'student',
  fallbackEmail,
  selection = null,
  defaultMessage,
  className,
}: ContactFormProps) {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(form: HTMLFormElement): Errors {
    const data = new FormData(form);
    const next: Errors = {};

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name) next.name = 'Enter your name.';
    if (!email) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!message) next.message = 'Tell us how we can help.';

    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(event.currentTarget);
    setErrors(found);
    setSubmitted(Object.keys(found).length === 0);
  }

  const fieldClasses =
    'rounded-md border border-border bg-surface px-4 py-3 text-base text-text focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2';

  return (
    <form noValidate onSubmit={handleSubmit} className={clsx('flex flex-col gap-5', className)}>
      {selection && (
        <>
          {/* Visible, so the visitor can see their choice survived the step —
              and correctable, because arriving on the wrong course with no way
              back is worse than not carrying it at all. */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-accent-soft px-4 py-3">
            <p className="text-sm text-text">
              <span className="font-semibold">Applying for:</span>{' '}
              <a href={selection.href} className="rounded-sm text-primary underline">
                {selection.label}
              </a>
            </p>
            <a
              href="/contact?intent=signup"
              className="rounded-sm text-sm text-text-muted underline underline-offset-4 hover:text-primary"
            >
              Change
            </a>
          </div>
          <input type="hidden" name="selection" value={selection.value} />
        </>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-name`} className="text-sm font-medium text-text">
          Your name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={fieldClasses}
        />
        {errors.name && (
          <p id={`${id}-name-error`} className="text-sm text-danger">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-email`} className="text-sm font-medium text-text">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
          className={fieldClasses}
        />
        {errors.email && (
          <p id={`${id}-email-error`} className="text-sm text-danger">
            {errors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-role`} className="text-sm font-medium text-text">
          I am a
        </label>
        <select id={`${id}-role`} name="role" defaultValue={defaultRole} className={fieldClasses}>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-message`} className="text-sm font-medium text-text">
          How can we help?
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          /* defaultValue, not value: seeded once, then it is the visitor's. */
          defaultValue={defaultMessage}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={fieldClasses}
        />
        {errors.message && (
          <p id={`${id}-message-error`} className="text-sm text-danger">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-6 py-4 text-base font-semibold text-on-primary shadow-sm transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        Send message
      </button>

      {submitted && (
        <div
          role="status"
          data-placeholder="true"
          className="rounded-md border border-warning bg-surface p-4 text-sm text-text"
        >
          <p className="font-semibold">This form is not connected yet.</p>
          <p className="mt-2">
            Your details were not sent anywhere. Until the intake endpoint is live, please email{' '}
            <a
              href={`mailto:${fallbackEmail}`}
              className="rounded-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              {fallbackEmail}
            </a>{' '}
            and we will come straight back to you.
          </p>
        </div>
      )}
    </form>
  );
}
