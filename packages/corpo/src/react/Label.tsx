import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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
