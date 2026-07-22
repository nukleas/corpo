import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { CpColor } from '../lib/types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Palette family. @default 'neutral' */
  color?: CpColor;
  /** Leading status dot. @default false */
  dot?: boolean;
  children?: ReactNode;
}

/** Corpo badge — bordered mono uppercase chip at AA contrast. */
export function Badge({ color = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('cp-badge', color !== 'neutral' && `cp-badge--${color}`, className)} {...rest}>
      {dot && <span className="cp-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
