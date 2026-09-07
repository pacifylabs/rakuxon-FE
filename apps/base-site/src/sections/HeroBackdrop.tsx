/**
 * The hero backdrop: a cartographic SVG, not a photograph.
 *
 * "Where Minds Meet Maps" drawn literally — a graticule, topographic contours,
 * and dashed great-circle arcs travelling between waypoints, with a graduation
 * cap on the node where the journey lands.
 *
 * Why not the photo slideshow it replaces:
 *   - text contrast used to depend on which slide happened to be showing,
 *     which is not something you can hold to AA;
 *   - it cost six full-bleed images and a client component with a timer;
 *   - a photo of a campus is not this product, and every competitor has one.
 *
 * This is a Server Component with no JavaScript at all. The motion guard lives
 * in the SVG's own <style>, so a visitor who asks for less motion gets it
 * before hydration rather than after.
 *
 * Every colour is a token, so the drawing follows the theme — including dark
 * mode — without a second palette.
 *
 * Deliberately wordless. City labels were tried and cut: preserveAspectRatio
 * "slice" rescales the drawing with the hero's height, so the sides crop by a
 * different amount at every viewport and a name that fits on one screen becomes
 * half a word on the next. The graticule, contours, arcs and pins already read
 * as a map, and the destinations appear as real links in § 3.6 below.
 */
export function HeroBackdrop({
  variant = 'hero',
  className,
}: {
  /**
   * 'hero' is the full drawing. 'page' is the same map at a fraction of the
   * opacity, for the long scrolling pages where it should register as texture
   * and never compete with a paragraph.
   */
  variant?: 'hero' | 'page';
  className?: string;
} = {}) {
  return (
    <div
      data-testid="hero-backdrop"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${
        variant === 'page' ? 'opacity-40' : ''
      } ${className ?? ''}`}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        role="presentation"
        className="h-full w-full"
      >
        <style>{`
          .rk-arc { stroke-dasharray: 10 14; }
          @media (prefers-reduced-motion: no-preference) {
            .rk-arc { animation: rk-travel 3.2s linear infinite; }
            .rk-arc-2 { animation-duration: 4.1s; }
            .rk-arc-3 { animation-duration: 5s; }
            .rk-pulse { animation: rk-pulse 3.6s ease-out infinite; transform-origin: center; }
            .rk-pulse-2 { animation-delay: 1.2s; }
          }
          @keyframes rk-travel { to { stroke-dashoffset: -48; } }
          @keyframes rk-pulse {
            0%   { r: 10; opacity: .55; }
            70%  { r: 30; opacity: 0; }
            100% { r: 30; opacity: 0; }
          }
        `}</style>

        <defs>
          {/* Atmosphere: warm centre so the copy sits on calm ground. */}
          <radialGradient id="rk-wash" cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="var(--color-surface)" />
            <stop offset="55%" stopColor="var(--color-accent-soft)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-surface-muted)" stopOpacity="0.9" />
          </radialGradient>

          {/* One contour, reused at four scales — topography for the price of a path. */}
          <path
            id="rk-contour"
            d="M0 0C62-42 152-52 214-10c62 42 92 112 50 164-42 52-134 62-196 26C6 144-42 60 0 0Z"
          />

          <linearGradient id="rk-arc-ink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          </linearGradient>

          {/* Fades the graticule out behind the headline instead of cropping it.
              black/white here are mask luminance, not colour — a token would be
              wrong, since the mask must mean "hide" and "show" in every theme. */}
          <radialGradient id="rk-clear-centre" cx="50%" cy="42%" r="52%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="70%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <mask id="rk-centre-mask">
            <rect width="1440" height="900" fill="url(#rk-clear-centre)" />
          </mask>
        </defs>

        <rect width="1440" height="900" fill="url(#rk-wash)" />

        {/* ---- Graticule: meridians bowed like a globe, parallels flat ---- */}
        <g
          mask="url(#rk-centre-mask)"
          stroke="var(--color-primary)"
          strokeOpacity="0.13"
          fill="none"
          strokeWidth="1"
        >
          <path d="M120 0C40 300 40 600 120 900" />
          <path d="M330 0C270 300 270 600 330 900" />
          <path d="M550 0C520 300 520 600 550 900" />
          <path d="M770 0v900" />
          <path d="M990 0c30 300 30 600 0 900" />
          <path d="M1210 0c60 300 60 600 0 900" />
          <path d="M1400 0c80 300 80 600 0 900" />
          <path d="M0 150h1440M0 330h1440M0 510h1440M0 690h1440M0 860h1440" />
        </g>

        {/* ---- Topographic contours, kept to the corners ---- */}
        <g stroke="var(--color-tint-tone3)" strokeOpacity="0.22" fill="none" strokeWidth="1.5">
          <use href="#rk-contour" transform="translate(60 560) scale(1.15)" />
          <use href="#rk-contour" transform="translate(96 588) scale(0.82)" strokeOpacity="0.16" />
          <use href="#rk-contour" transform="translate(130 614) scale(0.5)" strokeOpacity="0.12" />
        </g>
        <g stroke="var(--color-tint-tone1)" strokeOpacity="0.2" fill="none" strokeWidth="1.5">
          <use href="#rk-contour" transform="translate(1130 90) scale(1.25) rotate(18)" />
          <use
            href="#rk-contour"
            transform="translate(1168 128) scale(0.88) rotate(18)"
            strokeOpacity="0.15"
          />
          <use
            href="#rk-contour"
            transform="translate(1204 162) scale(0.52) rotate(18)"
            strokeOpacity="0.1"
          />
        </g>

        {/*
          ---- Journeys ----
          Masked like the graticule. On a phone, "slice" crops to the middle of
          the drawing, and an unmasked arc ran straight through the headline —
          the arcs only stay clear of the copy at desktop widths. The mask makes
          that true at every width instead of by luck.
        */}
        <g
          mask="url(#rk-centre-mask)"
          fill="none"
          stroke="url(#rk-arc-ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path className="rk-arc" d="M240 208C560 44 960 30 1204 152" />
          <path className="rk-arc rk-arc-2" d="M150 664C300 566 328 470 214 372" />
          <path className="rk-arc rk-arc-3" d="M1298 628C1170 560 1140 470 1256 322" />
          <path className="rk-arc rk-arc-2" d="M186 792C540 906 980 902 1286 806" />
        </g>

        {/* ---- Waypoints ---- */}
        <g mask="url(#rk-centre-mask)">
          <Waypoint x={240} y={208} />
          <Waypoint x={214} y={372} pulse />
          <Waypoint x={150} y={664} />
          <Waypoint x={1256} y={322} pulse delayed />
          <Waypoint x={1298} y={628} />
          <Waypoint x={186} y={792} small />
          <Waypoint x={1286} y={806} small />
        </g>

        {/* ---- Where the journey lands: minds meet maps ---- */}
        <g transform="translate(1204 152)">
          {/* Ringed, so it groups with the other waypoints instead of reading
              as a dark circular button parked in the upper corner. */}
          <circle r="30" fill="var(--color-accent)" opacity="0.12" />
          <circle r="21" fill="var(--color-primary)" />
          <g transform="translate(-10.5 -7.5) scale(0.044)" fill="var(--color-on-primary)">
            <path d="M240 0 480 120 240 240 0 120Z" />
            <path d="M96 172v92c0 30 64 56 144 56s144-26 144-56v-92l-144 72Z" />
            <path d="M440 148v104a16 16 0 0 1-32 0V148Z" />
          </g>
        </g>
      </svg>

      {/* Melts the drawing into the page rather than ending on a hard edge.
          h-20 (80px) is the tallest height the token spacing scale defines, so
          the fade is two stacked bands: a single taller utility would be off
          the scale, compile to nothing, and leave a hard seam. */}
      <div className="absolute inset-x-0 bottom-20 h-20 bg-gradient-to-b from-transparent to-bg opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-bg/60 to-bg" />
    </div>
  );
}

/** A map node: ring, dot, and optionally the halo that breathes. */
function Waypoint({
  x,
  y,
  pulse = false,
  delayed = false,
  small = false,
}: {
  x: number;
  y: number;
  pulse?: boolean;
  delayed?: boolean;
  small?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {pulse && (
        <circle
          className={`rk-pulse${delayed ? ' rk-pulse-2' : ''}`}
          r="10"
          fill="var(--color-accent)"
          opacity="0.55"
        />
      )}
      <circle
        r={small ? 6 : 9}
        fill="var(--color-surface)"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
      <circle r={small ? 2.5 : 3.5} fill="var(--color-accent)" />
    </g>
  );
}
