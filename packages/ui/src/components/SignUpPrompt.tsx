import clsx from 'clsx';
import { ArrowRight, BellRing, FileCheck2, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from './Button';

export interface SignUpPromptProps {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Three short reasons. Defaults to what an account actually unlocks. */
  benefits?: readonly { icon: LucideIcon; label: string }[];
  reassurance?: string;
  className?: string;
}

const DEFAULT_BENEFITS = [
  { icon: Sparkles, label: 'Courses matched to your grades and budget' },
  { icon: FileCheck2, label: 'Documents checked before you submit' },
  { icon: BellRing, label: 'Deadline reminders that reach you' },
] as const;

/**
 * The conversion panel shown where a list would otherwise be empty.
 *
 * It replaces a message that told the visitor a build variable was unset —
 * true, useless to them, and an admission that something is broken. An empty
 * region is the cheapest place on a page to ask for a sign-up, because the
 * visitor already wants the thing behind it.
 *
 * It states what an account gives, not what we want. "Sign up to see more" is
 * a toll; three concrete benefits and a free-consultation line are an offer.
 */
export function SignUpPrompt({
  heading,
  body,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  benefits = DEFAULT_BENEFITS,
  reassurance,
  className,
}: SignUpPromptProps) {
  return (
    <section
      aria-labelledby="signup-prompt-heading"
      className={clsx(
        'overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
        className,
      )}
    >
      <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Sparkles size={13} aria-hidden="true" focusable="false" />
            Free to start
          </span>

          <h2
            id="signup-prompt-heading"
            className="mt-4 font-heading text-2xl font-bold text-text md:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-3 max-w-prose text-base text-text-muted">{body}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ctaHref} size="lg">
              {ctaLabel}
              <ArrowRight size={18} aria-hidden="true" focusable="false" />
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button href={secondaryHref} size="lg" variant="ghost">
                {secondaryLabel}
              </Button>
            )}
          </div>

          {reassurance && <p className="mt-3 text-sm text-text-muted">{reassurance}</p>}
        </div>

        <ul className="flex flex-col justify-center gap-4 rounded-lg bg-surface-muted p-6">
          {benefits.map((benefit) => (
            <li key={benefit.label} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface text-primary">
                <benefit.icon size={16} aria-hidden="true" focusable="false" />
              </span>
              <span className="text-sm text-text">{benefit.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
