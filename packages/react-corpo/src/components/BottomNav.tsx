import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface BottomNavItem {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  /** Corner slot — typically a {@link Badge} count. */
  badge?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/inbox' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element, as in SideNav
  linkProps?: Record<string, unknown>;
}

export interface BottomNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Three to five destinations. */
  items: BottomNavItem[];
  activeId?: string | null;
  /** Fired on item click (also fires alongside link navigation). */
  onSelect?: (id: string) => void;
}

/**
 * Corpo bottom navigation — a phone tab bar of three to five top-level
 * destinations. Place it after {@link AppShellContent} inside
 * {@link AppShellMain}: there it shows only below 768px, where the sidebar
 * goes off-canvas. Items are buttons, or links via `href` / `as` + `linkProps`.
 */
export function BottomNav({ items, activeId, onSelect, className, ...rest }: BottomNavProps) {
  return (
    <nav className={cn('cp-bottom-nav', className)} {...rest}>
      {items.map((item) => {
        const isLink = Boolean(item.as || item.href);
        const Component: ElementType = item.as ?? (isLink ? 'a' : 'button');
        return (
          <Component
            key={item.id}
            {...(isLink ? { href: item.href } : { type: 'button' })}
            className="cp-bottom-nav__item"
            aria-current={activeId === item.id ? 'page' : undefined}
            onClick={() => onSelect?.(item.id)}
            {...item.linkProps}
          >
            <span className="cp-bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.badge != null && <span className="cp-bottom-nav__badge">{item.badge}</span>}
          </Component>
        );
      })}
    </nav>
  );
}
