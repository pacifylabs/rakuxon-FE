import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

describe('<Switch/>', () => {
  it('exposes its state as a switch role, not a plain button', () => {
    render(<Switch checked={false} onChange={vi.fn()} label="Featured" />);
    const control = screen.getByRole('switch', { name: 'Featured' });
    expect(control).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects checked in aria-checked', () => {
    render(<Switch checked onChange={vi.fn()} label="Featured" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange on click', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Featured" />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when asked, so a pending request cannot be double-fired', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Featured" disabled />);
    const control = screen.getByRole('switch');
    expect(control).toBeDisabled();
    await userEvent.click(control);
    expect(onChange).not.toHaveBeenCalled();
  });
});
