import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { cx } from './cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  /** Element or component to render as (e.g. `'a'` or a router `Link`). */
  as?: ElementType;
  /** Link target when rendering as an anchor. */
  href?: string;
  children?: ReactNode;
}

export function Button({
  as,
  variant = 'default',
  size = 'md',
  icon = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const Component: ElementType = as ?? 'button';
  return (
    <Component
      className={cx(
        'cp-btn',
        variant !== 'default' && `cp-btn--${variant}`,
        size !== 'md' && `cp-btn--${size}`,
        icon && 'cp-btn--icon',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
