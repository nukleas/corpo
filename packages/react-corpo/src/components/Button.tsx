import type { ElementType, ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { PolymorphicProps } from '../lib/polymorphic';

export interface ButtonOwnProps {
  /** Visual emphasis — use `primary` at most once per view. @default 'default' */
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  /** Control height: 28 / 36 / 44px. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Square icon-only button. @default false */
  icon?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, ButtonOwnProps>;

/**
 * Corpo action button — mono uppercase label, 2px radius, quiet tint hover.
 * Renders a `<button>` by default; pass `as="a"` (with `href`) or a router
 * `Link` for navigation styled as a button.
 */
export function Button<C extends ElementType = 'button'>({
  as,
  variant = 'default',
  size = 'md',
  icon = false,
  className,
  children,
  ...rest
}: ButtonProps<C>) {
  const Component: ElementType = as ?? 'button';
  return (
    <Component
      className={cn(
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
