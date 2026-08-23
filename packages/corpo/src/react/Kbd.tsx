import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Kbd({ className = '', children, ...rest }: KbdProps) {
  return (
    <kbd className={cx('cp-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
}
