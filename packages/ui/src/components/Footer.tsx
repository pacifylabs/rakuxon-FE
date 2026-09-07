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
  /**
   * One entry per office, labelled. Rakuxon runs two, and a labelled block
   * reads at a glance where a run-on "UK: …, Nigeria: …" line does not.
   */
  addresses?: readonly { label: string; lines: readonly string[] }[];
  /** Rendered as tel: links — on a phone this is the fastest path to a human. */
  phones?: readonly string[];
  /** Short paragraph under the tagline. */
  blurb?: string;
  columns: readonly FooterColumn[];
  socials: readonly NavLink[];
  legalLinks?: readonly NavLink[];
  className?: string;
}

/* 32px rows: comfortably past the 24px WCAG 2.2 target minimum, and tighter
   than the 36px that made six-link columns feel half-empty. */
const LINK_CLASSES =
  'flex min-h-8 items-center rounded-sm text-sm text-text-muted underline-offset-4 transition-colors duration-fast ease-standard hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none';

const HEADING_CLASSES = 'text-xs font-semibold uppercase tracking-wide text-text';

/**
 * Global footer (docs/04b § 2), in three bands.
 *
 * It used to be one row: a brand column carrying the tagline, blurb, six
 * contact lines and the socials, beside four link columns of four to six
 * items. The brand column set the row height and everything else sat in a
 * pocket of empty space beneath its own last link.
 *
 * Splitting it fixes the cause rather than the symptom. Band one holds the
 * wide, tall content — brand and contact, which are naturally horizontal.
 * Band two is four link columns of similar length, so they end together. Band
 * three is legal and copyright.
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
          {/* Band 1 — brand and contact, the wide content. */}
          <div className="grid gap-8 border-b border-border pb-8 lg:grid-cols-[1.1fr_1.4fr] lg:gap-12">
            <div className="flex flex-col gap-3">
              <Wordmark href="/" size="sm" />
              <p className="text-sm font-medium italic text-text-muted">{strapline}</p>
              {blurb && <p className="max-w-prose text-sm text-text-muted">{blurb}</p>}

              {socials.length > 0 && (
                <nav aria-label="Social" className="mt-1">
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

            {/* Reach us: channels first, then the offices side by side. */}
            <div className="flex flex-col gap-5">
              <h2 className={HEADING_CLASSES}>Contact</h2>

              <ul className="flex flex-wrap gap-x-8 gap-y-1">
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
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className={clsx(LINK_CLASSES, 'gap-2')}
                    >
                      <Phone size={14} className="shrink-0 text-primary" aria-hidden="true" />
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="flex min-h-8 items-center text-sm text-text-muted">{domain}</li>
              </ul>

              {addresses && addresses.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((office) => (
                    <li key={office.label} className="flex gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-text">{office.label}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-text-muted">
                          {office.lines.join(', ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Band 2 — the link columns, all of similar length so they end together. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-8 sm:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading} className="min-w-0">
                <h2 className={HEADING_CLASSES}>{column.heading}</h2>
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

          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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
