import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Control height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Error state. @default false */
  error?: boolean;
  children?: ReactNode;
}

/** Corpo native select with a CSS-drawn chevron. */
export function Select({ size = 'md', error = false, className, children, ...rest }: SelectProps) {
  return (
    <span className={cn('cp-select', size !== 'md' && `cp-select--${size}`, error && 'cp-select--error', className)}>
      <select className="cp-select__control" {...rest}>
        {children}
      </select>
      <span className="cp-select__chevron" aria-hidden="true" />
    </span>
  );
}
