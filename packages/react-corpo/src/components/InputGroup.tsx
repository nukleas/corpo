import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Content before the input, e.g. a currency symbol. */
  leading?: ReactNode;
  /** Content after the input, e.g. a unit label. */
  trailing?: ReactNode;
  children?: ReactNode;
}

/** Corpo input group — wraps an {@link Input} with a leading/trailing addon. */
export function InputGroup({ leading, trailing, className, children, ...rest }: InputGroupProps) {
  return (
    <div className={cn('cp-input-group', className)} {...rest}>
      {leading && <span className="cp-input-group__addon cp-input-group__addon--leading">{leading}</span>}
      {children}
      {trailing && <span className="cp-input-group__addon cp-input-group__addon--trailing">{trailing}</span>}
    </div>
  );
}
