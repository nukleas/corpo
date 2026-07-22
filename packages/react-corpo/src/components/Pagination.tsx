import { cn } from '../lib/cn';

export interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Show a "Page X of Y" readout. @default false */
  showInfo?: boolean;
  className?: string;
}

function getPageList(page: number, totalPages: number, siblingCount: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);
  pages.push(1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

/** Corpo pagination — windowed page list with prev/next and ellipsis. */
export function Pagination({ page, totalPages, onChange, siblingCount = 1, showInfo = false, className }: PaginationProps) {
  const pages = getPageList(page, totalPages, siblingCount);
  return (
    <nav aria-label="Pagination" className={cn('cp-pagination', className)}>
      <button type="button" className="cp-pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        ‹
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="cp-pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className="cp-pagination__btn"
            aria-current={p === page || undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className="cp-pagination__btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        ›
      </button>
      {showInfo && (
        <span className="cp-pagination__info">
          Page {page} of {totalPages}
        </span>
      )}
    </nav>
  );
}
