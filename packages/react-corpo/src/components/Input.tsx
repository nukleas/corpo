import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Control height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Left accent bar — Cyberdesign's search-field heritage. @default false */
  accent?: boolean;
  /** Error state — red border. @default false */
  error?: boolean;
}

/** Corpo text input — white field, 1px border, accent focus ring. */
export function Input({ size = 'md', accent = false, error = false, className, ...rest }: InputProps) {
  return (
    <input
      className={cn('cp-input', size !== 'md' && `cp-input--${size}`, accent && 'cp-input--accent', error && 'cp-input--error', className)}
      {...rest}
    />
  );
}
