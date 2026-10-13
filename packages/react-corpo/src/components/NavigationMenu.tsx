import { useEffect, useId, useRef, useState, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface NavigationMenuLink {
  id: string;
  label: ReactNode;
  /** Second line in a panel link. */
  description?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/invoices' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element, as in SideNav
  linkProps?: Record<string, unknown>;
}

export interface NavigationMenuItem extends NavigationMenuLink {
  /** Links in a dropdown panel — the item becomes a disclosure button instead of a link. */
  links?: NavigationMenuLink[];
}

export interface NavigationMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: NavigationMenuItem[];
  /** Id of the current page's link; its top-level item is marked active too. */
  activeId?: string | null;
  /** Fired on link click (also fires alongside link navigation). */
  onSelect?: (id: string) => void;
}

/**
 * Corpo navigation menu — a horizontal app or site nav whose items are links
 * or open a panel of links (WAI-ARIA disclosure navigation, not a `menu`:
 * Tab moves through the links). Click toggles a panel; Escape, a click
 * outside, or tabbing out closes it. Give it an `aria-label`.
 */
export function NavigationMenu({ items, activeId, onSelect, className, ...rest }: NavigationMenuProps) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const base = useId();

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(null);
      root.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus();
    };
    // Tabbing out of the nav closes the panel too.
    const onFocusIn = (e: FocusEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open]);

  const link = (l: NavigationMenuLink, className: string, children: ReactNode) => {
    const Component: ElementType = l.as ?? 'a';
    return (
      <Component
        href={l.href}
        className={className}
        aria-current={activeId === l.id ? 'page' : undefined}
        onClick={() => {
          onSelect?.(l.id);
          setOpen(null);
        }}
        {...l.linkProps}
      >
        {children}
      </Component>
    );
  };

  return (
    <nav ref={root} className={cn('cp-navmenu', className)} {...rest}>
      <ul className="cp-navmenu__list">
        {items.map((item, i) => {
          if (!item.links) {
            return (
              <li key={item.id} className="cp-navmenu__item">
                {link(item, 'cp-navmenu__link', item.label)}
              </li>
            );
          }
          const isOpen = open === item.id;
          const panelId = `${base}-panel-${i}`;
          return (
            <li key={item.id} className="cp-navmenu__item">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={cn('cp-navmenu__trigger', item.links.some((l) => l.id === activeId) && 'is-active')}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                {item.label}
                <span className="cp-navmenu__chevron" aria-hidden="true">
                  ▾
                </span>
              </button>
              <ul id={panelId} className="cp-navmenu__panel" hidden={!isOpen}>
                {item.links.map((l) => (
                  <li key={l.id}>
                    {link(
                      l,
                      'cp-navmenu__panel-link',
                      <>
                        <span className="cp-navmenu__panel-title">{l.label}</span>
                        {l.description && <span className="cp-navmenu__panel-description">{l.description}</span>}
                      </>,
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
