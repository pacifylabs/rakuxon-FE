import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Applied to both the header and body cell — e.g. `text-right` for a numeric column. */
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Rendered instead of the table when `rows` is empty. */
  emptyState?: ReactNode;
}

/**
 * The first `<table>` in this codebase — every list before it was a card
 * `<ul>`, which reads fine at three or four facts per row but runs out of
 * room once a row carries the kind of column count an admin list actually
 * has (name, status, country, action, action, action). Shared so every admin
 * list — old and new — renders the same way rather than each inventing its
 * own column layout.
 */
export function DataTable<T>({ columns, rows, getRowKey, emptyState }: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-text-muted ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-border bg-surface last:border-b-0 hover:bg-surface-muted">
              {columns.map((column) => (
                <td key={column.header} className={`px-4 py-3 align-middle text-text ${column.className ?? ''}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
