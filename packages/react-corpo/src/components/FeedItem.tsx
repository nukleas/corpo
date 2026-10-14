import { Children, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { PolymorphicProps } from '../lib/polymorphic';

export interface FeedItemOwnProps {
  /** Leading category — a {@link Badge} or {@link StatusPill}. */
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  time?: ReactNode;
  /** The row whose record is open — e.g. beside it in a {@link SplitView}. @default false */
  selected?: boolean;
  className?: string;
  children?: ReactNode;
}

export type FeedItemProps<C extends ElementType = 'button'> = PolymorphicProps<C, FeedItemOwnProps>;

/**
 * Corpo feed item — a compact selectable row for a master list or feed:
 * category and time, title, a line of detail. A button by default (`as="a"`
 * for links); `selected` marks it `aria-current`.
 */
export function FeedItem<C extends ElementType = 'button'>({
  as,
  badge,
  title,
  subtitle,
  time,
  selected = false,
  className,
  children,
  ...rest
}: FeedItemProps<C>) {
  const Component: ElementType = as ?? 'button';
  return (
    <Component
      {...(Component === 'button' && { type: 'button' })}
      className={cn('cp-feed-item', className)}
      aria-current={selected || undefined}
      {...rest}
    >
      {(badge != null || time != null) && (
        <span className="cp-feed-item__meta">
          {badge}
          {time != null && <span className="cp-feed-item__time">{time}</span>}
        </span>
      )}
      <span className="cp-feed-item__title">{title}</span>
      {subtitle != null && <span className="cp-feed-item__subtitle">{subtitle}</span>}
      {children}
    </Component>
  );
}

/** A list of {@link FeedItem}s, divided by hairlines. Each child is wrapped in an `<li>`. */
export function Feed({ className, children, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn('cp-feed', className)} {...rest}>
      {Children.toArray(children).map((child, i) => (
        <li key={i}>{child}</li>
      ))}
    </ul>
  );
}
