import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis — use `primary` at most once per view. @default 'default' */
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  /** Control height: 28 / 36 / 44px. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Square icon-only button. @default false */
  icon?: boolean;
  children?: ReactNode;
}

/** Corpo action button — mono uppercase label, 2px radius, quiet tint hover. */
export function Button({
  variant = 'default',
  size = 'md',
  icon = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'cp-btn',
        variant !== 'default' && `cp-btn--${variant}`,
        size !== 'md' && `cp-btn--${size}`,
        icon && 'cp-btn--icon',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
