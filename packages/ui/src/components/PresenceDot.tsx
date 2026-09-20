export interface PresenceDotProps {
  /** Seen in the last two minutes, per the backend's own polling-heartbeat window. */
  online: boolean;
  className?: string;
}

/** A small colored dot plus its own text label — never color alone, so the state reads without relying on color vision. */
export function PresenceDot({ online, className }: PresenceDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${className ?? ''}`}>
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${online ? 'bg-success' : 'bg-border'}`}
      />
      <span className={online ? 'text-success' : 'text-text-muted'}>{online ? 'Online' : 'Offline'}</span>
    </span>
  );
}
