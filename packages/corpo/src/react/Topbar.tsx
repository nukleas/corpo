import type { HTMLAttributes, ReactNode } from 'react';

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface TopbarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Shows the mobile nav toggle (visible below 768px). */
  onNavToggle?: () => void;
  actions?: ReactNode;
  children?: ReactNode;
}

export function Topbar({ title, onNavToggle, actions, className = '', children, ...rest }: TopbarProps) {
  return (
    <header className={cx('cp-topbar', className)} {...rest}>
      {onNavToggle && (
        <button type="button" className="cp-topbar__nav-toggle" aria-label="Open navigation" onClick={onNavToggle}>
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
