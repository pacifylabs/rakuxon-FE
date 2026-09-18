'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastEntry {
  id: string;
  tone: ToastTone;
  message: string;
}

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** How long a toast stays up before it dismisses itself. */
const AUTO_DISMISS_MS = 6000;

const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

/* A left accent border plus a coloured icon, not a tinted background — the
   token colours are CSS custom properties, so Tailwind's `/alpha` opacity
   modifier produces nothing on them (see StatusBadge's own note on this). */
const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-l-primary text-primary',
  error: 'border-l-danger text-danger',
  info: 'border-l-border text-text-muted',
};

/**
 * One place for every save/create/update/publish/suspend/delete/upload
 * result to surface, instead of a local `role="alert"` paragraph repeated
 * on every screen. Mount once per app root; call `useToast()` anywhere
 * beneath it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeTimers.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, tone, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message),
      info: (message: string) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border-l-4 bg-surface p-4 shadow-lg ${TONE_CLASSES[toast.tone]}`}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-sm text-text">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-sm text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast() must be used inside a <ToastProvider>.');
  return context;
}
