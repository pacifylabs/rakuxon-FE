'use client';

import clsx from 'clsx';
import { Mail, MapPin, Phone } from 'lucide-react';

import { useBrand } from '../theme/useTheme';
import { BrandName } from './BrandName';
import { SocialIcon } from './SocialIcon';
import { Wordmark } from './Wordmark';
import type { NavLink } from './Header';

export interface FooterColumn {
  heading: string;
  links: readonly NavLink[];
}

export interface FooterProps {
  /** Defaults to the brand tagline token. */
  tagline?: string;
  domain: string;
  email?: string;
  /** One line per office. Rakuxon runs two, and both belong here. */
  addresses?: readonly string[];
  /** Rendered as tel: links — on a phone this is the fastest path to a human. */
  phones?: readonly string[];
  /** Short paragraph under the tagline. */
  blurb?: string;
  columns: readonly FooterColumn[];
  socials: readonly NavLink[];
  legalLinks?: readonly NavLink[];
  className?: string;
}

const LINK_CLASSES =
  'flex min-h-9 items-center rounded-sm text-sm text-text-muted underline-offset-4 transition-colors duration-fast ease-standard hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none';

/**
 * Global footer (docs/04b § 2), laid out on the rakuxon-care grid: a brand
 * column carrying contact details and socials, then the link columns.
 *
 * The link columns are their own grid below `lg` and `lg:contents` above it,
 * so they flow two- or three-up on small screens and drop into the parent's
 * columns on desktop without a second breakpoint set to keep in sync.
 */
export function Footer({
  tagline,
  domain,
  email,
  addresses,
  phones,
  blurb,
  columns,
  socials,
  legalLinks,
  className,
}: FooterProps) {
  const brand = useBrand();
  const strapline = tagline ?? brand.tagline;

  return (
    <footer className={clsx('w-full bg-surface px-5 pb-6 pt-12 md:pt-16', className)}>
      <div className="mx-auto w-full max-w-content">
        <div className="rounded-xl border border-border bg-surface-muted px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-10">
            <div className="flex flex-col gap-4">
              <Wordmark href="/" size="sm" />
              <p className="max-w-prose text-sm font-medium italic text-text-muted">
                {strapline}
              </p>
              {blurb && <p className="max-w-prose text-sm text-text-muted">{blurb}</p>}

              <ul className="flex flex-col">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={clsx(LINK_CLASSES, 'gap-2')}>
                      <Mail size={14} className="shrink-0 text-primary" aria-hidden="true" />
                      {email}
                    </a>
                  </li>
                )}
                {phones?.map((phone) => (
                  <li key={phone}>
                    {/* tel: strips to digits and a leading + — spaces break the dialler. */}
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className={clsx(LINK_CLASSES, 'gap-2')}>
                      <Phone size={14} className="shrink-0 text-primary" aria-hidden="true" />
                      {phone}
                    </a>
                  </li>
                ))}
                {addresses?.map((entry) => (
                  <li
                    key={entry}
                    className="flex items-start gap-2 py-1.5 text-sm text-text-muted"
                  >
                    <MapPin size={14} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                    {entry}
                  </li>
                ))}
                <li className="py-1.5 text-sm text-text-muted">{domain}</li>
              </ul>

              {socials.length > 0 && (
                <nav aria-label="Social">
                  <ul className="flex flex-wrap items-center gap-2">
                    {socials.map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="grid h-10 w-10 place-items-center rounded-full border border-border text-sm font-semibold text-text-muted transition-colors duration-fast ease-standard hover:bg-accent-soft hover:text-primary focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                          aria-label={`${brand.name} on ${social.label}`}
                        >
                          <SocialIcon label={social.label} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>

            {/* Own grid on small screens, parent columns on desktop. */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:contents">
              {columns.map((column) => (
                <nav key={column.heading} aria-label={column.heading} className="min-w-0">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-text">
                    {column.heading}
                  </h2>
                  <ul className="mt-3 flex flex-col">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className={LINK_CLASSES}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {legalLinks && legalLinks.length > 0 && (
              <nav aria-label="Legal">
                <ul className="grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={LINK_CLASSES}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} <BrandName part="lead" />. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
