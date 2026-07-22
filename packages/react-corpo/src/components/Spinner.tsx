import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. @default 16 */
  size?: number;
  /** Mono label beside the ring. */
  label?: ReactNode;
}

/** Corpo spinner — plain accent ring, no flicker or glow. */
export function Spinner({ size = 16, label, className, ...rest }: SpinnerProps) {
  return (
    <span role="status" className={cn('cp-spinner', className)} {...rest}>
      <span className="cp-spinner__ring" aria-hidden="true" style={{ width: size, height: size }} />
      {label ? <span className="cp-spinner__label">{label}</span> : <span className="cp-spinner__sr-only">Loading</span>}
    </span>
  );
}
