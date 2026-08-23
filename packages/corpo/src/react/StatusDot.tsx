import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
}

export function StatusDot({ tone = 'ok', className = '', ...rest }: StatusDotProps) {
  return <span className={cx('cp-status-dot', `cp-status-dot--${tone}`, className)} aria-hidden="true" {...rest} />;
}
