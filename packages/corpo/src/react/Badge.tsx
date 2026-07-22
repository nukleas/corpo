import type { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'neutral' | 'accent' | 'green' | 'red' | 'amber' | 'blue' | 'magenta' | 'purple';
  dot?: boolean;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Badge({ color = 'neutral', dot = false, className = '', children, ...rest }: BadgeProps) {
  return (
    <span className={cx('cp-badge', color !== 'neutral' && `cp-badge--${color}`, className)} {...rest}>
      {dot && <span className="cp-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
