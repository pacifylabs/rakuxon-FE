'use client';

import { useBrand } from '../theme/useTheme';

export interface BrandNameProps {
  /**
   * `full` — the whole product name ("Rakuxon").
   * `lead` — the name without its accent suffix ("Rakuxon"), for company prose
   *   such as a copyright line.
   */
  part?: 'full' | 'lead';
}

/**
 * Plain-text brand name from tokens, so prose can follow a tenant rename
 * without the name being hard-coded in app copy.
 */
export function BrandName({ part = 'full' }: BrandNameProps) {
  const { name, nameAccentSuffix } = useBrand();

  if (part === 'lead' && nameAccentSuffix.length > 0 && name.endsWith(nameAccentSuffix)) {
    return <>{name.slice(0, name.length - nameAccentSuffix.length).trim()}</>;
  }

  return <>{name}</>;
}
