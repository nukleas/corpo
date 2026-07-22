import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'heading' | 'avatar' | 'block';
  width?: number | string;
  height?: number | string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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
