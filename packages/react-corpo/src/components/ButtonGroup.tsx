import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {}

/** Corpo button group — visually joins adjacent {@link Button}s into one control. */
export function ButtonGroup({ className, children, ...rest }: ButtonGroupProps) {
  return (
    <div className={cn('cp-button-group', className)} role="group" {...rest}>
      {children}
    </div>
  );
}
