import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './ConfirmDialog';

function Harness({
  onConfirm = vi.fn(),
  confirming = false,
  tone,
}: {
  onConfirm?: () => void;
  confirming?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <ConfirmDialog
      open
      onOpenChange={vi.fn()}
      title="Suspend this partner?"
      description="They will lose access immediately."
      confirmLabel="Suspend"
      onConfirm={onConfirm}
      confirming={confirming}
      tone={tone}
    />
  );
}

describe('<ConfirmDialog/>', () => {
  it('renders the title, description and both actions when open', () => {
    render(<Harness />);

    expect(screen.getByRole('dialog', { name: 'Suspend this partner?' })).toBeInTheDocument();
    expect(screen.getByText('They will lose access immediately.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Suspend this partner?"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('fires onConfirm when the confirm action is clicked', async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Suspend this partner?"
        onConfirm={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables both actions and shows a pending label while confirming', () => {
    render(<Harness confirming />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled();
  });

  it('disables only the confirm action when confirmDisabled is set', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="Reject this document?"
        confirmLabel="Confirm reject"
        onConfirm={vi.fn()}
        confirmDisabled
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirm reject' })).toBeDisabled();
  });

  it('renders extra content passed as children', () => {
    render(
      <ConfirmDialog open onOpenChange={vi.fn()} title="Reject this document?" onConfirm={vi.fn()}>
        <textarea aria-label="Reason" />
      </ConfirmDialog>,
    );

    expect(screen.getByLabelText('Reason')).toBeInTheDocument();
  });
});
