import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SideNavItem {
  id: string;
  label: ReactNode;
  /** Right-aligned slot — typically a {@link Badge} count. */
  badge?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/invoices' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element (router props are untyped here by design)
  linkProps?: Record<string, unknown>;
}

export interface SideNavSection {
  /** Section heading; omit for an untitled top group. */
  title?: ReactNode;
  items: SideNavItem[];
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Brand/product row pinned above the sections. */
  brand?: ReactNode;
  sections: SideNavSection[];
  /** Id of the active item. */
  activeId?: string | null;
  /** Fired on item click (also fires alongside link navigation). */
  onSelect?: (id: string, item: SideNavItem) => void;
  /** Pinned bottom slot — typically the signed-in user. */
  footer?: ReactNode;
}

/**
 * Sidebar navigation — brand, titled sections of items, active state, and a
 * pinned footer. Items render as buttons, or as real links via `href` or the
 * `as` + `linkProps` pattern (router links).
 */
export function SideNav({
  brand,
  sections,
  activeId,
  onSelect,
  footer,
  className,
  ...rest
}: SideNavProps) {
  return (
    <nav className={cn('cp-sidenav', className)} {...rest}>
      {brand != null && <div className="cp-sidenav__brand">{brand}</div>}
      <div className="cp-sidenav__sections">
        {sections.map((section, si) => (
          <div key={si} className="cp-sidenav__section">
            {section.title != null && (
              <div className="cp-sidenav__section-title">{section.title}</div>
            )}
            {section.items.map((item) => {
              const isLink = Boolean(item.as || item.href);
              const ItemComponent: ElementType = item.as ?? (isLink ? 'a' : 'button');
              return (
                <ItemComponent
                  key={item.id}
                  {...(isLink ? { href: item.href } : { type: 'button' })}
                  className={cn('cp-sidenav__item', activeId === item.id && 'is-active')}
                  aria-current={activeId === item.id ? 'page' : undefined}
                  onClick={() => onSelect?.(item.id, item)}
                  {...item.linkProps}
                >
                  <span className="cp-sidenav__item-label">{item.label}</span>
                  {item.badge}
                </ItemComponent>
              );
            })}
          </div>
        ))}
      </div>
      {footer != null && <div className="cp-sidenav__footer">{footer}</div>}
    </nav>
  );
}
