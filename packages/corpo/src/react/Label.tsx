import type { LabelHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children?: ReactNode;
}

export function Label({ required = false, className = '', children, ...rest }: LabelProps) {
  return (
    <label className={cx('cp-label', className)} {...rest}>
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
