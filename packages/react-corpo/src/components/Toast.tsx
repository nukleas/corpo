import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic tone. @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'error';
  /** Uppercase mono title line. */
  title?: ReactNode;
  /** Renders a dismiss ×. */
  onDismiss?: () => void;
  children?: ReactNode;
}

/** Corpo toast — floating notification card, position it inside a fixed viewport. */
export function Toast({ tone = 'info', title, onDismiss, className, children, ...rest }: ToastProps) {
  return (
    <div role="status" className={cn('cp-toast', `cp-toast--${tone}`, className)} {...rest}>
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

export interface ToasterProps extends HTMLAttributes<HTMLDivElement> {}

/** Fixed bottom-right stack — render {@link Toast}s inside it. */
export function Toaster({ className, children, ...rest }: ToasterProps) {
  return (
    <div className={cn('cp-toaster', className)} {...rest}>
      {children}
    </div>
  );
}
