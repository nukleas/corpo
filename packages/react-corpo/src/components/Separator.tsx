import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  /** Line direction. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Centered mono label instead of a plain rule. */
  label?: string;
}

/** Corpo divider — hairline rule, optional centered mono label. */
export function Separator({ orientation = 'horizontal', label, className, ...rest }: SeparatorProps) {
  if (label) {
    return (
      <div role="separator" className={cn('cp-separator--labeled', className)}>
        {label}
      </div>
    );
  }
  return <hr className={cn('cp-separator', `cp-separator--${orientation}`, className)} {...rest} />;
}
