import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ScrollArea({ className = '', children, ...rest }: ScrollAreaProps) {
  return (
    <div className={cx('cp-scroll-area', className)} {...rest}>
      {children}
    </div>
  );
}
