import clsx from 'clsx';

import { CountryFlag } from './CountryFlag';
import { ImageCard } from './ImageCard';

export interface DestinationCardProps {
  country: string;
  /** Omit for a destination with no written guide; the flag stands in. */
  src?: string;
  alt?: string;
  countryCode?: string;
  href: string;
  /** Short line under the photo. Kept inside the card so rows stay level. */
  description?: string;
  className?: string;
}

/**
 * Country card in the destinations grid.
 *
 * The photo is optional. The catalogue covers twenty countries and six of them
 * have a written guide with commissioned imagery — the rest would otherwise
 * need a stock photo chosen to represent a country, which is both a licensing
 * question and a good way to caption Vienna as Berlin. Those fall back to a
 * flag on a plain ground, which is accurate and obviously deliberate.
 */
export function DestinationCard({
  country,
  src,
  alt,
  countryCode,
  href,
  description,
  className,
}: DestinationCardProps) {
  if (src) {
    return (
      <ImageCard
        src={src}
        alt={alt ?? ''}
        href={href}
        overlay
        className={className}
        footer={description ? <p className="text-sm text-text-muted">{description}</p> : undefined}
      >
        <h3 className="font-heading text-lg font-semibold text-on-scrim">{country}</h3>
      </ImageCard>
    );
  }

  return (
    <a
      href={href}
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[transform,box-shadow] duration-base ease-standard hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      {/* Matches the photo cards' 3:2 block, so a mixed row stays level. */}
      <span className="flex aspect-[3/2] items-center justify-center bg-accent-soft">
        <CountryFlag countryCode={countryCode} size="lg" />
      </span>

      <span className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold text-text">{country}</h3>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </span>
    </a>
  );
}
