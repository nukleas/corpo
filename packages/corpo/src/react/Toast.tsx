import type { HTMLAttributes, ReactNode } from 'react';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  onDismiss?: () => void;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Toast({ tone = 'info', title, onDismiss, className = '', children, ...rest }: ToastProps) {
  return (
    <div role="status" className={cx('cp-toast', `cp-toast--${tone}`, className)} {...rest}>
      <div className="cp-toast__content">
        {title && <div className="cp-toast__title">{title}</div>}
        <div className="cp-toast__body">{children}</div>
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="cp-toast__dismiss">
          ×
        </button>
      )}
    </div>
  );
}
