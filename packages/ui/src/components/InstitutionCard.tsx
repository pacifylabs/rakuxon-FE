import clsx from 'clsx';

import { AppLink } from './AppLink';
import { CountryFlag } from './CountryFlag';

export interface InstitutionCardFact {
  label: string;
  value: string;
}

export interface InstitutionCardProps {
  name: string;
  location: string;
  countryCode?: string;
  href: string;
  applyHref: string;
  facts?: readonly InstitutionCardFact[];
  badge?: string;
  className?: string;
}

/**
 * A university in the catalogue listing.
 *
 * Distinct from UniversityCard, which is the campus-photo card in the
 * marketing rows: this one carries facts and both actions, and is
 * structurally the twin of CourseCard so a page mixing the two reads as one
 * system rather than two.
 *
 * The country is a real flag, never a generic building glyph. The same icon
 * repeated down a grid says nothing the heading has not already said.
 *
 * The second action is "Proceed to apply", not "Visit website". Sending a
 * visitor to the university's own site is the one link on the page that ends
 * the journey we exist to run — and the university does not know Rakuxon sent
 * them.
 */
export function InstitutionCard({
  name,
  location,
  countryCode,
  href,
  applyHref,
  facts = [],
  badge,
  className,
}: InstitutionCardProps) {
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
            <CountryFlag countryCode={countryCode} className="mt-0.5" />
            <div>
              <h3 className="font-heading text-base font-semibold text-text">
                <AppLink
                  href={href}
                  className="rounded-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
                >
                  {name}
                </AppLink>
              </h3>
              <p className="mt-1 text-sm text-text-muted">{location}</p>
            </div>
          </div>

          {badge && (
            <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-md border border-border">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={clsx(
                  'p-3',
                  index % 2 === 0 && 'border-r border-border',
                  index >= 2 && 'border-t border-border',
                )}
              >
                <dd className="text-sm font-semibold text-text">{fact.value}</dd>
                <dt className="mt-0.5 text-xs text-text-muted">{fact.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <AppLink
            href={href}
            className="inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors duration-fast ease-standard hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            View details
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
