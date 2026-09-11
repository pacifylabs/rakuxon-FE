import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable } from './DataTable';

interface Row {
  id: string;
  name: string;
}

describe('<DataTable/>', () => {
  const columns = [{ header: 'Name', cell: (row: Row) => row.name }];
  const rows: Row[] = [
    { id: '1', name: 'Ada' },
    { id: '2', name: 'Grace' },
  ];

  it('renders one row per item, keyed by getRowKey', () => {
    render(<DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} />);
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 body rows
  });

  it('renders the empty state instead of an empty table', () => {
    render(
      <DataTable columns={columns} rows={[]} getRowKey={(row) => row.id} emptyState={<p>Nothing here</p>} />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
