import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { AppLink } from './AppLink';
import { CountryFlag } from './CountryFlag';

export interface InstitutionCardFact {
  icon?: LucideIcon;
  text: string;
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
 * No photo: the catalogue only has one for about half of what is imported,
 * and a grid where every other card is a different height and shape reads as
 * broken rather than varied. The flag carries the country instead — real,
 * not a generic building glyph, and true of every record.
 *
 * The badge floats over the top edge rather than sitting beside the name: a
 * fast-track offer is the one thing on this card worth noticing before the
 * name itself, so it gets the corner a reader's eye lands on first.
 *
 * The second action is "Proceed to apply", not "Visit website". Sending a
 * visitor to the university's own site is the one link on the page that ends
 * the journey we exist to run — and the university does not know Rakuxon sent
 * them. It is the filled button: the outline pairing this used to have gave
 * the primary action no more weight than "View details".
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
        'relative flex h-full flex-col overflow-visible rounded-lg border border-border bg-surface p-4 shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      {badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary shadow-sm">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-3">
        <CountryFlag countryCode={countryCode} size="sm" className="mt-0.5" />
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold text-text">
            <AppLink
              href={href}
              className="rounded-sm focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2"
            >
              {name}
            </AppLink>
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">{location}</p>
        </div>
      </div>


      {facts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <li
              key={fact.text}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-text-muted"
            >
              {fact.icon && <fact.icon size={12} aria-hidden="true" focusable="false" />}
              {fact.text}
            </li>
          ))}
        </ul>
      )}


      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <AppLink
          href={href}
          className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text transition-colors duration-fast ease-standard hover:bg-surface-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          View details
        </AppLink>
        <AppLink
          href={applyHref}
          className="inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 text-sm font-semibold text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Proceed to apply
        </AppLink>
      </div>
    </article>
  );
}
