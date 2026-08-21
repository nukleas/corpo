import type { ElementType, HTMLAttributes, ReactNode } from 'react';

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface SideNavItem {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/invoices' }`. */
  linkProps?: Record<string, unknown>;
}

export interface SideNavSection {
  title?: ReactNode;
  items: SideNavItem[];
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  brand?: ReactNode;
  sections: SideNavSection[];
  activeId?: string | null;
  onSelect?: (id: string, item: SideNavItem) => void;
  footer?: ReactNode;
}

export function SideNav({ brand, sections, activeId, onSelect, footer, className = '', ...rest }: SideNavProps) {
  return (
    <nav className={cx('cp-sidenav', className)} {...rest}>
      {brand != null && <div className="cp-sidenav__brand">{brand}</div>}
      <div className="cp-sidenav__sections">
        {sections.map((section, si) => (
          <div key={si} className="cp-sidenav__section">
            {section.title != null && <div className="cp-sidenav__section-title">{section.title}</div>}
            {section.items.map((item) => {
              const isLink = Boolean(item.as || item.href);
              const ItemComponent: ElementType = item.as ?? (isLink ? 'a' : 'button');
              return (
                <ItemComponent
                  key={item.id}
                  {...(isLink ? { href: item.href } : { type: 'button' })}
                  className={cx('cp-sidenav__item', activeId === item.id && 'is-active')}
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
