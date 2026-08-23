import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode;
}

export function Tooltip({ content, side = 'top', className = '', children, ...rest }: TooltipProps) {
  return (
    <span className={cx('cp-tooltip', className)} {...rest}>
      {children}
      <span className={cx('cp-tooltip__content', `cp-tooltip__content--${side}`)} role="tooltip">
        {content}
      </span>
    </span>
  );
}
