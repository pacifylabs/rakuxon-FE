import { HeroBackdrop } from './HeroBackdrop';

/**
 * The map, behind every page.
 *
 * The hero had it and nothing else did, so leaving the home page felt like
 * leaving the site. This is the same drawing at 40% opacity, fixed to the
 * viewport rather than the document: a backdrop that scrolls with a long page
 * would tile or stretch, and one that repeats a graticule down four screens
 * stops reading as a map and starts reading as wallpaper.
 *
 * `fixed` also means it costs one paint, not one per section.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <HeroBackdrop variant="page" />
    </div>
  );
}
