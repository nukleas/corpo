import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Corpo keyboard key cap — 2px bottom border, mono. */
export function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={cn('cp-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
}
