export interface LogoMarkProps {
  /** Rendered height in px. The lockup is drawn on a 150x52 grid. */
  height?: number;
  className?: string;
  /** Accessible name. The wordmark is the logo, so it carries the brand name. */
  title: string;
  /** Everything before the accent slice. The whole name when there is none. */
  lead: string;
  /** Trailing slice painted in the muted tone. Empty for a one-word name. */
  accent?: string;
}

/**
 * The Rakuxon lockup: the wordmark with a path line running beneath it
 * that steps down where the name divides and terminates in a node.
 *
 * Type is real text in the heading font rather than traced outlines, so the
 * mark needs no font files of its own and re-colours with the theme. The
 * supplied artwork sets an arrow inside a custom R's counter; real type has no
 * such counter to sit in, and overlaying it read as a mistake, so the line and
 * node carry the path idea instead.
 */
export function LogoMark({ height = 32, className, title, lead, accent = '' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 150 52"
      height={height}
      width={(height * 150) / 52}
      role="img"
      aria-label={title}
      className={className}
    >
      <text
        x="4"
        y="30"
        fontFamily="var(--font-heading)"
        fontSize="27"
        fontWeight="700"
        letterSpacing="-0.6"
        fill="var(--color-primary)"
      >
        {lead}
        {/* No hyphen for a one-word name — "Rakuxon-" would be a dangling glyph. */}
        {accent && <tspan fill="var(--color-text-muted)">-{accent}</tspan>}
      </text>

      {/*
        The path: runs under the type, steps down where the name divides, and
        ends on a node — the journey the product is named for.
      */}
      <path
        d="M5 43h70l7 6h9"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M91 49h9l7-6h29"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="142" cy="43" r="4.2" fill="none" stroke="var(--color-accent)" strokeWidth="2.6" />
    </svg>
  );
}
