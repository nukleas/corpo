import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape preset. @default 'text' */
  variant?: 'text' | 'heading' | 'avatar' | 'block';
  width?: number | string;
  height?: number | string;
}

/** Corpo loading placeholder — quiet shimmer, respects `prefers-reduced-motion`. */
export function Skeleton({ variant = 'text', width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('cp-skeleton', `cp-skeleton--${variant}`, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
