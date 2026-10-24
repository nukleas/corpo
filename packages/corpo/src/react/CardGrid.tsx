import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column count at a wide container. Steps down to 2 when the container is
   * at most 768px and to 1 at most 480px. @default 3
   */
  columns?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/** Card or stat grid. The root is the container; the track collapses by its width. */
export function CardGrid({ columns = 3, className, children, ...rest }: CardGridProps) {
  return (
    <div className={cx('cp-card-grid', className)} {...rest}>
      <div className={cx('cp-card-grid__track', columns > 1 && `cp-card-grid__track--${columns}`)}>{children}</div>
    </div>
  );
}
