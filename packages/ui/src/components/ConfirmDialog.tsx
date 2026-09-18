'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

import { Button } from './Button';

export type ConfirmDialogTone = 'default' | 'danger';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  onConfirm: () => void;
  /** Disables both buttons and swaps the confirm label to a pending state. */
  confirming?: boolean;
  /** Disables just the confirm action — e.g. a required reason field left empty. */
  confirmDisabled?: boolean;
  /** Extra content between the description and the actions — a reason field, for example. */
  children?: ReactNode;
}

/**
 * A controlled confirmation modal for anything destructive or otherwise
 * important enough to interrupt — suspend, reject, delete, reassign. Built on
 * Radix's unstyled dialog primitive for correct focus trap, ESC-to-close and
 * portal behaviour, styled to the token set.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  confirming = false,
  confirmDisabled = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !confirming && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim opacity-70" />
        <Dialog.Content
          onEscapeKeyDown={(event) => confirming && event.preventDefault()}
          onPointerDownOutside={(event) => confirming && event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 shadow-lg focus-visible:outline-none"
        >
          <Dialog.Title className="font-heading text-lg font-semibold text-text">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-text-muted">
              {description}
            </Dialog.Description>
          )}

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={confirming}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="md"
              disabled={confirming || confirmDisabled}
              onClick={onConfirm}
            >
              {confirming ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
