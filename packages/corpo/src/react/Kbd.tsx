import type { HTMLAttributes, ReactNode } from 'react';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Kbd({ className = '', children, ...rest }: KbdProps) {
  return (
    <kbd className={cx('cp-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
}
