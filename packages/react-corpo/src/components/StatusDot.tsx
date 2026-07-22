import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'ok' | 'warn' | 'err' | 'idle' | 'info';
}

/** Corpo status dot — small color-coded presence/state indicator. */
export function StatusDot({ tone = 'ok', className, ...rest }: StatusDotProps) {
  return <span className={cn('cp-status-dot', `cp-status-dot--${tone}`, className)} aria-hidden="true" {...rest} />;
}
