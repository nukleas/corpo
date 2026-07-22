import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** Tooltip copy shown on hover/focus. */
  content: ReactNode;
  /** Which side the tooltip opens toward. @default 'top' */
  side?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode;
}

/** Corpo tooltip — CSS-only, shows on hover or keyboard focus. */
export function Tooltip({ content, side = 'top', className, children, ...rest }: TooltipProps) {
  return (
    <span className={cn('cp-tooltip', className)} {...rest}>
      {children}
      <span className={cn('cp-tooltip__content', `cp-tooltip__content--${side}`)} role="tooltip">
        {content}
      </span>
    </span>
  );
}
