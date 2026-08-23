import type { HTMLAttributes } from 'react';
import { Skeleton } from './Skeleton';
import { cx } from './cx';

export interface SkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: boolean;
  lines?: number;
}

export function SkeletonRow({ avatar = true, lines = 2, className = '', ...rest }: SkeletonRowProps) {
  return (
    <div className={cx('cp-skeleton-row', className)} {...rest}>
      {avatar && <Skeleton variant="avatar" />}
      <div className="cp-skeleton-row__lines">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}
