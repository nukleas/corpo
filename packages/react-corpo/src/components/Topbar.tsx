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
  /** Right-aligned action row — buttons, search, an {@link Avatar}. */
  actions?: ReactNode;
  children?: ReactNode;
}

/** Application topbar — mobile nav toggle, title, and right-aligned actions. */
export function Topbar({ title, onNavToggle, actions, className, children, ...rest }: TopbarProps) {
  return (
    <header className={cn('cp-topbar', className)} {...rest}>
      {onNavToggle && (
        <button
          type="button"
          className="cp-topbar__nav-toggle"
          aria-label="Open navigation"
          onClick={onNavToggle}
        >
          <span className="cp-topbar__nav-toggle-icon" aria-hidden="true" />
        </button>
      )}
      {title != null && <div className="cp-topbar__title">{title}</div>}
      {children}
      <div className="cp-topbar__spacer" />
      {actions != null && <div className="cp-topbar__actions">{actions}</div>}
    </header>
  );
}
