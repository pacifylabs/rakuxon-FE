import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from './Toast';

function Trigger({ tone, message }: { tone: 'success' | 'error' | 'info'; message: string }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast[tone](message)}>
      Fire
    </button>
  );
}

describe('<ToastProvider/> / useToast()', () => {
  it('renders a success toast as a status region', async () => {
    render(
      <ToastProvider>
        <Trigger tone="success" message="Saved." />
      </ToastProvider>,
    );

    screen.getByRole('button', { name: 'Fire' }).click();

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('Saved.');
  });

  it('renders an error toast as an alert', async () => {
    render(
      <ToastProvider>
        <Trigger tone="error" message="Could not save." />
      </ToastProvider>,
    );

    screen.getByRole('button', { name: 'Fire' }).click();

    const toast = await screen.findByRole('alert');
    expect(toast).toHaveTextContent('Could not save.');
  });

  it('stacks multiple toasts', async () => {
    render(
      <ToastProvider>
        <Trigger tone="info" message="First" />
        <Trigger tone="info" message="Second" />
      </ToastProvider>,
    );

    const [first, second] = screen.getAllByRole('button', { name: 'Fire' });
    first!.click();
    second!.click();

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  it('dismisses on close-button click', async () => {
    render(
      <ToastProvider>
        <Trigger tone="info" message="Dismiss me" />
      </ToastProvider>,
    );

    screen.getByRole('button', { name: 'Fire' }).click();
    await screen.findByText('Dismiss me');

    screen.getByRole('button', { name: 'Dismiss' }).click();
    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses after its timeout', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger tone="info" message="Auto-dismiss" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole('button', { name: 'Fire' }).click();
    });
    expect(screen.getByText('Auto-dismiss')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6500);
    });
    expect(screen.queryByText('Auto-dismiss')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('throws a clear error when used outside a provider', () => {
    function Unwrapped() {
      useToast();
      return null;
    }

    // Suppress the expected console.error React logs for the thrown render.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Unwrapped />)).toThrow(/useToast\(\) must be used inside/);
    spy.mockRestore();
  });
});
