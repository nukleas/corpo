import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'heading' | 'avatar' | 'block';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ variant = 'text', width, height, className = '', style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cx('cp-skeleton', `cp-skeleton--${variant}`, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
