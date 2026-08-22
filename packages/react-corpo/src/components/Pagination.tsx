import type { ElementType, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number;
  totalPages: number;
  /** Page-click handler; optional when `as`/`linkProps` drive navigation. */
  onChange?: (page: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Show a "Page X of Y" readout. @default false */
  showInfo?: boolean;
  /** Custom link element for routed apps (e.g. a router `Link`); switches items from buttons to links. */
  as?: ElementType;
  /** Per-page props for the link element, e.g. ``(p) => ({ to: `/invoices?page=${p}` })``; switches items from buttons to links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element (router props are untyped here by design)
  linkProps?: (page: number) => Record<string, unknown>;
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

/**
 * Corpo pagination — windowed page list with prev/next and ellipsis.
 * Items are buttons driven by `onChange` by default; pass `as` and/or
 * `linkProps` to render them as real links (boundary prev/next become
 * `aria-disabled` spans).
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  showInfo = false,
  as,
  linkProps,
  className,
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
    <nav aria-label="Pagination" className={cn('cp-pagination', className)}>
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
