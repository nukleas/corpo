import type { ElementType, ReactNode } from 'react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  /** Page-click handler; optional when `as`/`linkProps` drive navigation. */
  onChange?: (page: number) => void;
  siblingCount?: number;
  showInfo?: boolean;
  /** Custom link element for routed apps (e.g. a router `Link`); switches items from buttons to links. */
  as?: ElementType;
  /** Per-page props for the link element, e.g. ``(p) => ({ to: `?page=${p}` })``; switches items from buttons to links. */
  linkProps?: (page: number) => Record<string, unknown>;
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

export function Pagination({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  showInfo = false,
  as,
  linkProps,
  className = '',
}: PaginationProps) {
  const pages = getPageList(page, totalPages, siblingCount);
  const linkMode = Boolean(as || linkProps);
  const LinkComponent: ElementType = as ?? 'a';

  function item(
    p: number,
    label: ReactNode,
    opts: { key?: string | number; ariaLabel?: string; disabled?: boolean; current?: boolean } = {},
  ) {
    const { key, ariaLabel, disabled = false, current = false } = opts;
    if (linkMode) {
      if (disabled) {
        return (
          <span key={key} className="cp-pagination__btn" aria-disabled="true" aria-label={ariaLabel}>
            {label}
          </span>
        );
      }
      return (
        <LinkComponent
          key={key}
          className="cp-pagination__btn"
          aria-label={ariaLabel}
          aria-current={current ? 'page' : undefined}
          onClick={onChange ? () => onChange(p) : undefined}
          {...linkProps?.(p)}
        >
          {label}
        </LinkComponent>
      );
    }
    return (
      <button
        key={key}
        type="button"
        className="cp-pagination__btn"
        aria-label={ariaLabel}
        aria-current={current || undefined}
        disabled={disabled}
        onClick={() => onChange?.(p)}
      >
        {label}
      </button>
    );
  }

  return (
    <nav aria-label="Pagination" className={cx('cp-pagination', className)}>
      {item(page - 1, '‹', { ariaLabel: 'Previous page', disabled: page <= 1 })}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="cp-pagination__ellipsis">
            …
          </span>
        ) : (
          item(p, p, { key: p, current: p === page })
        ),
      )}
      {item(page + 1, '›', { ariaLabel: 'Next page', disabled: page >= totalPages })}
      {showInfo && (
        <span className="cp-pagination__info">
          Page {page} of {totalPages}
        </span>
      )}
    </nav>
  );
}
