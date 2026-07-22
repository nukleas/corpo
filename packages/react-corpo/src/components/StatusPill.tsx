import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { StatusDot } from './StatusDot';

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
  children?: ReactNode;
}

/** Corpo status pill — a {@link StatusDot} paired with a text label. */
export function StatusPill({ tone = 'ok', className, children, ...rest }: StatusPillProps) {
  return (
    <span className={cn('cp-status-pill', className)} {...rest}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
