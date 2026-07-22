import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic tone. @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'error';
  /** Uppercase mono title line. */
  title?: ReactNode;
  /** Renders a dismiss ×. */
  onDismiss?: () => void;
  children?: ReactNode;
}

/** Corpo alert banner — 3px left accent border, tinted fill, mono title. */
export function Alert({ tone = 'info', title, onDismiss, className, children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('cp-alert', `cp-alert--${tone}`, className)} {...rest}>
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
