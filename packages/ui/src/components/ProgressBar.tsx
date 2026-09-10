export interface ProgressBarProps {
  label: string;
  /** 0-100. Values outside that range are clamped, not rejected. */
  percent: number;
}

/** A labelled linear progress bar — profile completeness, upload progress, a multi-step form. */
export function ProgressBar({ label, percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text">{label}</span>
        <span className="text-text-muted">{clamped}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
