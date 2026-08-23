import type { HTMLAttributes, ReactNode } from 'react';
import { StatusDot } from './StatusDot';
import { cx } from './cx';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
  children?: ReactNode;
}

export function StatusPill({ tone = 'ok', className = '', children, ...rest }: StatusPillProps) {
  return (
    <span className={cx('cp-status-pill', className)} {...rest}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
