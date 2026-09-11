export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  /** Fixed pixel height for the plot area — the Tailwind spacing scale this
   * preset ships does not reach tall enough for a chart, so this is a plain
   * style, not a `h-*` class. */
  height?: number;
}

/**
 * Plain vertical bars, scaled to the tallest value in the set. No external
 * charting library: the data here is a handful of status buckets, not a
 * dataset that needs axes, tooltips or zoom — CSS heights on token colours
 * do the job and stay themeable for free.
 */
export function BarChart({ data, height = 180 }: BarChartProps) {
  const max = Math.max(1, ...data.map((datum) => datum.value));

  if (data.length === 0) {
    return <p className="text-sm text-text-muted">No data yet.</p>;
  }

  return (
    <div className="flex items-end gap-4" style={{ height }}>
      {data.map((datum) => (
        <div key={datum.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-sm font-semibold text-text">{datum.value}</span>
          <div
            className="w-full rounded-t-md bg-primary"
            style={{ height: `${Math.max(2, (datum.value / max) * 100)}%` }}
            role="img"
            aria-label={`${datum.label}: ${datum.value}`}
          />
          <span className="text-center text-xs text-text-muted">{datum.label}</span>
        </div>
      ))}
    </div>
  );
}
