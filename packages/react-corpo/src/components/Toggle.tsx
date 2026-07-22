import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

/** Corpo toggle — a two-state button (e.g. bold/italic, show/hide). */
export function Toggle({ pressed = false, onPressedChange, size = 'md', className, children, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn('cp-toggle', size === 'sm' && 'cp-toggle--sm', className)}
      onClick={() => onPressedChange?.(!pressed)}
      {...rest}
    >
      {children}
    </button>
  );
}
