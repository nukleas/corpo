import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TopbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Page title (or pass a Breadcrumb as children instead). */
  title?: ReactNode;
  /**
   * Shows the mobile nav toggle (visible below 768px) and fires on click —
   * wire it to {@link AppShell}'s `navOpen`.
   */
  onNavToggle?: () => void;
  /** Right-aligned action row — buttons, search, an {@link Avatar}. Stays on screen. */
  actions?: ReactNode;
  /**
   * Link row — a {@link NavigationMenu} or a row of links. It scrolls inside
   * the bar instead of widening the page. Do not put tools here; use `actions`.
   */
  children?: ReactNode;
}

/**
 * Application topbar — mobile nav toggle, title, link row, and right-aligned actions.
 *
 * Top-nav contract: the bar is `min-width: 0` and does not widen the page.
 * Children render in `.cp-topbar__nav`, a nowrap row that scrolls horizontally
 * with an edge fade only when the links overflow. `.cp-topbar__actions` does
 * not shrink and stays visible. The bar does not wrap onto a second row.
 */
export function Topbar({ title, onNavToggle, actions, className, children, ...rest }: TopbarProps) {
  return (
    <header className={cn('cp-topbar', className)} {...rest}>
      {onNavToggle && (
        <button type="button" className="cp-topbar__nav-toggle" aria-label="Open navigation" onClick={onNavToggle}>
          <span className="cp-topbar__nav-toggle-icon" aria-hidden="true" />
        </button>
      )}
      {title != null && <div className="cp-topbar__title">{title}</div>}
      {children != null && <div className="cp-topbar__nav">{children}</div>}
      <div className="cp-topbar__spacer" />
      {actions != null && <div className="cp-topbar__actions">{actions}</div>}
    </header>
  );
}
