import type { HTMLAttributes } from 'react';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function StatusDot({ tone = 'ok', className = '', ...rest }: StatusDotProps) {
  return <span className={cx('cp-status-dot', `cp-status-dot--${tone}`, className)} aria-hidden="true" {...rest} />;
}
