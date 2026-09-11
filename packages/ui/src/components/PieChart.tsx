export interface PieChartDatum {
  label: string;
  value: number;
}

export interface PieChartProps {
  data: PieChartDatum[];
}

/** Cycles through the theme's decorative tints plus the state colours — enough
 * distinct, accessible hues for the handful of buckets a status breakdown has. */
const PALETTE = [
  'var(--color-primary)',
  'var(--tint-tone2)',
  'var(--tint-tone3)',
  'var(--color-warning)',
  'var(--tint-tone4)',
  'var(--color-danger)',
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A donut chart built from stacked SVG circle strokes — no external charting
 * library for what is, again, a handful of status buckets. Token colours via
 * `style`, not the `stroke` attribute, since SVG presentation attributes do
 * not reliably resolve `var()` the way an inline style does.
 */
export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  if (total === 0) {
    return <p className="text-sm text-text-muted">No data yet.</p>;
  }

  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        viewBox="0 0 100 100"
        className="shrink-0"
        style={{ width: 160, height: 160 }}
        role="img"
        aria-label="Breakdown by status"
      >
        <g transform="rotate(-90 50 50)">
          {data.map((datum, index) => {
            const fraction = datum.value / total;
            const dash = fraction * CIRCUMFERENCE;
            const segment = (
              <circle
                key={datum.label}
                cx={50}
                cy={50}
                r={RADIUS}
                fill="none"
                strokeWidth={20}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
                style={{ stroke: PALETTE[index % PALETTE.length] }}
              />
            );
            offset += dash;
            return segment;
          })}
        </g>
      </svg>

      <ul className="flex flex-col gap-2">
        {data.map((datum, index) => (
          <li key={datum.label} className="flex items-center gap-2 text-sm text-text">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
            />
            {datum.label}
            <span className="text-text-muted">
              {datum.value} ({Math.round((datum.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
