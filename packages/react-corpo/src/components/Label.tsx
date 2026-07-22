import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Show required asterisk. @default false */
  required?: boolean;
  children?: ReactNode;
}

/** Corpo form label — the uppercase mono micro-label. */
export function Label({ required = false, className, children, ...rest }: LabelProps) {
  return (
    <label className={cn('cp-label', className)} {...rest}>
      {children}
      {required && (
        <span className="cp-label__required" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </label>
  );
}
