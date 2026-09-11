import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart } from './BarChart';

describe('<BarChart/>', () => {
  it('renders one bar per datum, labelled with its value', () => {
    render(
      <BarChart
        data={[
          { label: 'Draft', value: 3 },
          { label: 'Submitted', value: 7 },
        ]}
      />,
    );

    expect(screen.getByLabelText('Draft: 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Submitted: 7')).toBeInTheDocument();
  });

  it('shows a fallback message when there is nothing to plot', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('No data yet.')).toBeInTheDocument();
  });
});
