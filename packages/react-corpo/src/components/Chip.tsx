import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Renders a remove × button when provided. */
  onRemove?: () => void;
  children?: ReactNode;
}

/** Corpo chip — removable filter/tag pill. */
export function Chip({ onRemove, className, children, ...rest }: ChipProps) {
  return (
    <span className={cn('cp-chip', className)} {...rest}>
      {children}
      {onRemove && (
        <button type="button" className="cp-chip__remove" aria-label="Remove" onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  );
}
