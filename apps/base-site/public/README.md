# Static assets

## logo.svg / logo.png — not yet supplied

`packages/ui/src/components/LogoMark.tsx` currently *redraws* the Rakuxon
lockup: the wordmark in the heading font, plus the path line and node. It is a
faithful interpretation, not the original artwork.

To swap in the real asset:

1. Drop the file here as `logo.svg` (preferred) or `logo.png`.
2. Replace the body of `LogoMark` with:

   ```tsx
   import Image from 'next/image';

   export function LogoMark({ height = 32, className, title }: LogoMarkProps) {
     return (
       <Image
         src="/logo.svg"
         alt={title}
         height={height}
         width={(height * 210) / 52}
         priority
         className={className}
       />
     );
   }
   ```

3. `pnpm test` — `Wordmark` asserts the accessible name, not the drawing, so
   the suite should stay green.

An SVG is strongly preferred: the mark sits at 26–44px in a sticky header, and
a raster needs @2x artwork and will not follow a theme change.
