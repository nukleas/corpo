import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Corpo scroll area — overflow container with a thin, quiet scrollbar. */
export function ScrollArea({ className, children, ...rest }: ScrollAreaProps) {
  return (
    <div className={cn('cp-scroll-area', className)} {...rest}>
      {children}
    </div>
  );
}
