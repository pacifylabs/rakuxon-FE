'use client';

import clsx from 'clsx';

import { useBrand } from '../theme/useTheme';
import { BrandLogo } from './BrandLogo';
import { LogoMark } from './LogoMark';

export interface WordmarkProps {
  /** Renders inside an existing link when false. Defaults to a link home. */
  href?: string;
  className?: string;
  /** Shows the strapline beneath the lockup. */
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MARK_HEIGHT = { sm: 26, md: 32, lg: 44 } as const;

/**
 * The brand lockup. Reads the `brand` tokens, so renaming the product is a
 * token change — nothing here hard-codes it.
 */
export function Wordmark({
  href = '/',
  className,
  showTagline = false,
  size = 'md',
}: WordmarkProps) {
  const { name, nameAccentSuffix, tagline, logo } = useBrand();

  const hasAccent =
    nameAccentSuffix.length > 0 &&
    nameAccentSuffix.length < name.length &&
    name.endsWith(nameAccentSuffix);

  const lead = (hasAccent ? name.slice(0, name.length - nameAccentSuffix.length) : name).trim();
  const accent = hasAccent ? nameAccentSuffix.toLowerCase() : '';

  const content = (
    <>
      {/* The real asset when the brand has one; the drawn mark otherwise, so a
          white-label tenant without a logo is never left with a gap. */}
      {logo ? (
        <BrandLogo height={MARK_HEIGHT[size]} />
      ) : (
        <LogoMark height={MARK_HEIGHT[size]} title={name} lead={lead} accent={accent} />
      )}
      {showTagline && <span className="text-sm text-text-muted">{tagline}</span>}
    </>
  );

  const classes = clsx(
    'inline-flex flex-col gap-1 rounded-sm',
    'focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2',
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} aria-label={name}>
        {content}
      </a>
    );
  }

  return <span className={classes}>{content}</span>;
}
