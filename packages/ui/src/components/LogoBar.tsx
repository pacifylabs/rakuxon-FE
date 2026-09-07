import clsx from 'clsx';

import { InstitutionLogo } from './InstitutionLogo';
import type { InstitutionEmblem } from './InstitutionLogo';

export interface PartnerLogo {
  name: string;
  emblem: InstitutionEmblem;
  kind?: string;
  founded?: number;
}

export interface LogoBarProps {
  label: string;
  logos: readonly PartnerLogo[];
  className?: string;
}

/**
 * The trust bar that straddles the hero and the section beneath it
 * (docs/04b § 3.2). Greyscale partner lockups on a floating white card.
 */
export function LogoBar({ label, logos, className }: LogoBarProps) {
  return (
    <div
      data-trust-bar=""
      className={clsx('rounded-lg border border-border bg-surface px-6 py-8 shadow-lg', className)}
    >
      <p className="text-center text-sm font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <ul className="mt-6 grid grid-cols-1 items-center justify-items-start gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:justify-items-center">
        {logos.map((logo) => (
          <li key={logo.name}>
            <InstitutionLogo
              name={logo.name}
              emblem={logo.emblem}
              kind={logo.kind}
              founded={logo.founded}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
