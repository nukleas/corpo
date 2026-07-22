import type { HTMLAttributes, ReactNode } from 'react';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  onDismiss?: () => void;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Alert({ tone = 'info', title, onDismiss, className = '', children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('cp-alert', `cp-alert--${tone}`, className)} {...rest}>
      <div className="cp-alert__content">
        {title && <div className="cp-alert__title">{title}</div>}
        <div className="cp-alert__body">{children}</div>
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="cp-alert__dismiss">
          ×
        </button>
      )}
    </div>
  );
}
