import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface TopbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Shows the mobile nav toggle (visible below 768px). */
  onNavToggle?: () => void;
  /** Right-aligned tools. They stay on screen; they do not scroll with the links. */
  actions?: ReactNode;
  /** Link row. Scrolls inside `.cp-topbar__nav` instead of widening the page. */
  children?: ReactNode;
}

/**
 * Application topbar. Children render in `.cp-topbar__nav` (nowrap, horizontal
 * scroll, edge fade only when the links overflow). `actions` stay visible.
 */
export function Topbar({ title, onNavToggle, actions, className = '', children, ...rest }: TopbarProps) {
  return (
    <header className={cx('cp-topbar', className)} {...rest}>
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
