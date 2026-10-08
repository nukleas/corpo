import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ScrollArea({ className = '', children, ...rest }: ScrollAreaProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll container must be focusable for keyboard scrolling (WCAG 2.1.1)
    <div className={cx('cp-scroll-area', className)} tabIndex={0} {...rest}>
      {children}
    </div>
  );
}
