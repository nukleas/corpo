import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column count at a wide container. Steps down to 2 when the container is
   * at most 768px and to 1 at most 480px. The container is this component,
   * not the viewport. @default 3
   */
  columns?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Corpo card grid — a row of {@link Card}s or {@link Stat}s that collapses by
 * its own width. Use it for dashboard tiles. A narrow column stacks the cards
 * even when the viewport is wide.
 */
export function CardGrid({ columns = 3, className, children, ...rest }: CardGridProps) {
  return (
    <div className={cn('cp-card-grid', className)} {...rest}>
      <div className={cn('cp-card-grid__track', columns > 1 && `cp-card-grid__track--${columns}`)}>{children}</div>
    </div>
  );
}
