import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  label?: ReactNode;
}

export function Spinner({ size = 16, label, className = '', ...rest }: SpinnerProps) {
  return (
    <span role="status" className={cx('cp-spinner', className)} {...rest}>
      <span className="cp-spinner__ring" aria-hidden="true" style={{ width: size, height: size }} />
      {label ? <span className="cp-spinner__label">{label}</span> : <span className="cp-spinner__sr-only">Loading</span>}
    </span>
  );
}
