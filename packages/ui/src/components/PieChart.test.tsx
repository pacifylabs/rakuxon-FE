import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PieChart } from './PieChart';

describe('<PieChart/>', () => {
  it('lists every slice with its share of the total', () => {
    render(
      <PieChart
        data={[
          { label: 'Complete', value: 3 },
          { label: 'In progress', value: 1 },
        ]}
      />,
    );

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('3 (75%)')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('1 (25%)')).toBeInTheDocument();
  });

  it('shows a fallback message when the total is zero', () => {
    render(<PieChart data={[{ label: 'Empty', value: 0 }]} />);
    expect(screen.getByText('No data yet.')).toBeInTheDocument();
  });
});
