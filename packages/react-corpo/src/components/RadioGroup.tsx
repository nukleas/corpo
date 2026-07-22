import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
}

/** Corpo radio group — lays out a set of {@link Radio}s with consistent spacing. */
export function RadioGroup({ orientation = 'vertical', className, children, ...rest }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn('cp-radio-group', orientation === 'horizontal' && 'cp-radio-group--horizontal', className)} {...rest}>
      {children}
    </div>
  );
}
