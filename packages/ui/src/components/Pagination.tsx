import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** Prev/next + a page readout — every admin list endpoint already returns page/pageCount/total. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="grid size-10 place-items-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>

      <span className="text-sm text-text-muted">
        Page {page} of {pageCount}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className="grid size-10 place-items-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
