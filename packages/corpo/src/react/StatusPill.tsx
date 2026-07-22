import type { HTMLAttributes, ReactNode } from 'react';
import { StatusDot } from './StatusDot';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function StatusPill({ tone = 'ok', className = '', children, ...rest }: StatusPillProps) {
  return (
    <span className={cx('cp-status-pill', className)} {...rest}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
