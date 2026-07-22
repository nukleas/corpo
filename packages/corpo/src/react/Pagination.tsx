export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  showInfo?: boolean;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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

export function Pagination({ page, totalPages, onChange, siblingCount = 1, showInfo = false, className = '' }: PaginationProps) {
  const pages = getPageList(page, totalPages, siblingCount);
  return (
    <nav aria-label="Pagination" className={cx('cp-pagination', className)}>
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
