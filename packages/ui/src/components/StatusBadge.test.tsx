import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

describe('<StatusBadge/>', () => {
  it('renders its children as the visible label', () => {
    render(<StatusBadge>Active</StatusBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the negative tone with a border rather than an alpha-modified background', () => {
    render(<StatusBadge tone="negative">Suspended</StatusBadge>);
    // The alpha modifier on a CSS-custom-property color compiles to nothing
    // (see the tailwind-preset note), so `negative` uses a solid border
    // instead of repeating `positive`'s `bg-primary/15` approach.
    expect(screen.getByText('Suspended')).toHaveClass('border', 'border-danger', 'text-danger');
  });
});
