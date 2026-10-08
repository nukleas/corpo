import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Corpo scroll area — overflow container with a thin, quiet scrollbar. */
export function ScrollArea({ className, children, ...rest }: ScrollAreaProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll container must be focusable for keyboard scrolling (WCAG 2.1.1)
    <div className={cn('cp-scroll-area', className)} tabIndex={0} {...rest}>
      {children}
    </div>
  );
}
