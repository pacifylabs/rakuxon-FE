'use client';

import Image from 'next/image';

import { useBrand } from '../theme/useTheme';

/**
 * The brand image, when the tenant has one.
 *
 * Both files render and CSS hides one (see LOGO_SWAP_RULES in cssVars.ts).
 * The alternative — reading the resolved scheme in JS — would either flash the
 * wrong artwork before hydration or force this into a client-only render, and
 * the logo is the first thing painted.
 *
 * `priority` is deliberate: this sits in the header, so it is almost always
 * the largest contentful paint candidate on a marketing page.
 */
export function BrandLogo({ height, className }: { height: number; className?: string }) {
  const { name, logo, logoDark, logoWidth, logoHeight } = useBrand();

  const intrinsicWidth = Number(logoWidth);
  const intrinsicHeight = Number(logoHeight);

  if (!logo || !intrinsicWidth || !intrinsicHeight) return null;

  const width = Math.round((intrinsicWidth / intrinsicHeight) * height);
  const common = {
    width,
    height,
    priority: true,
    className,
    /*
     * The brand name, not empty alt. Inside <Wordmark/>'s link an aria-label
     * already names it and overrides descendant content, so nothing is
     * announced twice — but Wordmark also renders without a link, and there
     * the alt is the only accessible name the mark has.
     */
    alt: name,
    sizes: `${width}px`,
  };

  return (
    <>
      <Image {...common} src={logo} data-rk-logo="light" />
      {logoDark && <Image {...common} src={logoDark} data-rk-logo="dark" />}
    </>
  );
}
