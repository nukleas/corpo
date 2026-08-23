import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

export function Toggle({ pressed = false, onPressedChange, size = 'md', className = '', children, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx('cp-toggle', size === 'sm' && 'cp-toggle--sm', className)}
      onClick={() => onPressedChange?.(!pressed)}
      {...rest}
    >
      {children}
    </button>
  );
}
