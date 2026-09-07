import clsx from 'clsx';

import { AppLink } from './AppLink';
import { CountryFlag } from './CountryFlag';

export interface CourseCardFact {
  label: string;
  value: string;
  /** Deadlines and time pressure only — the amber tint's whole job. */
  urgent?: boolean;
}

export interface CourseCardProps {
  title: string;
  institution: string;
  /** ISO-2. Renders the real flag, never a stand-in icon. */
  countryCode?: string;
  href: string;
  applyHref: string;
  facts: readonly CourseCardFact[];
  badge?: string;
  className?: string;
}

/**
 * A course in a list: title, the four facts that decide whether to read on,
 * and both actions.
 *
 * The facts sit in a bordered 2×2 grid because they are compared *across*
 * cards — a visitor scans the fee column down the page, and prose would make
 * that impossible.
 *
 * Two buttons, deliberately. "View course" is the safe one and comes first;
 * "Proceed to apply" is the commitment and is visually stronger. Offering only
 * the second forces a decision before anyone has the facts to make it.
 */
export function CourseCard({
  title,
  institution,
  countryCode,
  href,
  applyHref,
  facts,
  badge,
  className,
}: CourseCardProps) {
  return (
    <article
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <CountryFlag countryCode={countryCode} className="mt-0.5 shrink-0" />
            <div>
              <h3 className="font-heading text-base font-semibold text-text">
                <AppLink
                  href={href}
                  className="rounded-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  {title}
                </AppLink>
              </h3>
              <p className="mt-1 text-sm text-text-muted">{institution}</p>
            </div>
          </div>

          {badge && (
            <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-md border border-border">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={clsx(
                'p-3',
                /* Interior rules only: a border on every cell would double up
                   against the container's own. */
                index % 2 === 0 && 'border-r border-border',
                index >= 2 && 'border-t border-border',
              )}
            >
              <dd
                className={clsx(
                  'text-sm font-semibold',
                  fact.urgent ? 'text-tint-urgent' : 'text-text',
                )}
              >
                {fact.value}
              </dd>
              <dt className="mt-0.5 text-xs text-text-muted">{fact.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <AppLink
            href={href}
            className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors duration-fast ease-standard hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            View course
          </AppLink>
          <AppLink
            href={applyHref}
            className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-primary bg-surface px-4 text-sm font-semibold text-primary transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Proceed to apply
          </AppLink>
        </div>
      </div>
    </article>
  );
}
