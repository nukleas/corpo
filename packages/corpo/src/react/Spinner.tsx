import type { HTMLAttributes, ReactNode } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  label?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Spinner({ size = 16, label, className = '', ...rest }: SpinnerProps) {
  return (
    <span role="status" className={cx('cp-spinner', className)} {...rest}>
      <span className="cp-spinner__ring" aria-hidden="true" style={{ width: size, height: size }} />
      {label ? <span className="cp-spinner__label">{label}</span> : <span className="cp-spinner__sr-only">Loading</span>}
    </span>
  );
}
