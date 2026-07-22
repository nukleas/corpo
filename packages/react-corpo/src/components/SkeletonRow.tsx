import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Skeleton } from './Skeleton';

export interface SkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Leading avatar placeholder. @default true */
  avatar?: boolean;
  /** Number of text lines. @default 2 */
  lines?: number;
}

/** Inline row of {@link Skeleton} pieces — avatar + text lines, e.g. a loading list item. */
export function SkeletonRow({ avatar = true, lines = 2, className, ...rest }: SkeletonRowProps) {
  return (
    <div className={cn('cp-skeleton-row', className)} {...rest}>
      {avatar && <Skeleton variant="avatar" />}
      <div className="cp-skeleton-row__lines">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}
