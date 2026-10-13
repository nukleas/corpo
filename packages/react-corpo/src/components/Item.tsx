import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { PolymorphicProps } from '../lib/polymorphic';

export interface ItemOwnProps {
  /** Leading visual — an {@link Avatar}, icon, or thumbnail. */
  media?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Trailing controls. Leave empty when the whole item is a link or button. */
  actions?: ReactNode;
  /** A framed row on the panel surface. @default false */
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ItemProps<C extends ElementType = 'div'> = PolymorphicProps<C, ItemOwnProps>;

/**
 * Corpo item — a generic list row: media, title and description, trailing
 * actions. Render it `as="li"` inside {@link ItemGroup}, or `as="a"` /
 * `as="button"` to make the whole row a target (then put no actions in it).
 */
export function Item<C extends ElementType = 'div'>({
  as,
  media,
  title,
  description,
  actions,
  bordered = false,
  className,
  children,
  ...rest
}: ItemProps<C>) {
  const Component: ElementType = as ?? 'div';
  return (
    <Component className={cn('cp-item', bordered && 'cp-item--bordered', className)} {...rest}>
      {media != null && <span className="cp-item__media">{media}</span>}
      <span className="cp-item__content">
        {title != null && <span className="cp-item__title">{title}</span>}
        {description != null && <span className="cp-item__description">{description}</span>}
        {children}
      </span>
      {actions != null && <span className="cp-item__actions">{actions}</span>}
    </Component>
  );
}

/** A list of {@link Item}s — render each `as="li"`. */
export function ItemGroup({ className, children, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn('cp-item-group', className)} {...rest}>
      {children}
    </ul>
  );
}
