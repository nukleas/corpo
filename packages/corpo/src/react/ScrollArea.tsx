import type { HTMLAttributes, ReactNode } from 'react';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ScrollArea({ className = '', children, ...rest }: ScrollAreaProps) {
  return (
    <div className={cx('cp-scroll-area', className)} {...rest}>
      {children}
    </div>
  );
}
