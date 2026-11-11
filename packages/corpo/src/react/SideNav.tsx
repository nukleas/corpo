import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from './cx';
import { placeElement } from './place';
import { moveRovingFocus } from './roving';

export interface SideNavItem {
  id: string;
  label: ReactNode;
  /** Leading icon. Every top-level item needs one when the nav is `collapsed`. */
  icon?: ReactNode;
  /** Right-aligned slot — typically a {@link Badge} count. */
  badge?: ReactNode;
  href?: string;
  /** Custom link element for routed apps (e.g. a router `Link`). */
  as?: ElementType;
  /** Extra props for the link element, e.g. `{ to: '/invoices' }` for router links. */
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type -- deliberate verbatim passthrough to the caller-chosen link element (router props are untyped here by design)
  linkProps?: Record<string, unknown>;
  /**
   * Child items. The item becomes a group toggle that expands in place, or
   * opens a flyout from the collapsed rail. It is not a link itself.
   */
  items?: SideNavItem[];
}

export interface SideNavSection {
  /** Section heading; omit for an untitled top group. Hidden in the collapsed rail. */
  title?: ReactNode;
  items: SideNavItem[];
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Brand/product row pinned above the sections. */
  brand?: ReactNode;
  sections: SideNavSection[];
  /** Id of the active item. Its groups open on mount and whenever it changes. */
  activeId?: string | null;
  /** Fired on item click (also fires alongside link navigation). */
  onSelect?: (id: string, item: SideNavItem) => void;
  /** Pinned bottom slot — typically the signed-in user. */
  footer?: ReactNode;
  /**
   * Icon rail: top-level items show only their icon, with the label as a
   * tooltip; groups open as a flyout. Desktop only — keep the full nav in the
   * off-canvas drawer below 768px.
   */
  collapsed?: boolean;
}

/** Ids of the groups that contain `id`, outermost first. */
function pathTo(items: SideNavItem[], id: string): string[] | null {
  for (const item of items) {
    if (item.id === id) return [];
    if (item.items) {
      const below = pathTo(item.items, id);
      if (below) return [item.id, ...below];
    }
  }
  return null;
}

const activePath = (sections: SideNavSection[], id: string | null | undefined) =>
  id == null ? [] : (sections.map((s) => pathTo(s.items, id)).find(Boolean) ?? []);

/**
 * Sidebar navigation — brand, titled sections of items, nested module groups,
 * active state, and a pinned footer. Items render as buttons, or as real links
 * via `href` or the `as` + `linkProps` pattern (router links).
 *
 * Tab reaches every item; ArrowUp/ArrowDown/Home/End move between visible
 * items, ArrowRight opens a group (or steps into it), ArrowLeft closes it (or
 * steps out to its parent). `collapsed` turns the nav into an icon rail.
 */
export function SideNav({
  brand,
  sections,
  activeId,
  onSelect,
  footer,
  collapsed = false,
  className,
  ...rest
}: SideNavProps) {
  const base = useId();
  const path = activePath(sections, activeId);
  const [expanded, setExpanded] = useState(() => new Set(path));
  const [seenActive, setSeenActive] = useState(activeId);
  // A newly active item opens its groups; groups the user closed elsewhere stay closed.
  if (activeId !== seenActive) {
    setSeenActive(activeId);
    setExpanded((prev) => new Set([...prev, ...path]));
  }

  const [flyout, setFlyout] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ label: ReactNode; anchor: HTMLElement } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const toggleId = (id: string) => `${base}-${id}-toggle`;
  const groupId = (id: string) => `${base}-${id}-group`;
  const openFlyout = collapsed ? flyout : null;

  useLayoutEffect(() => {
    const panel = flyoutRef.current;
    const anchor = openFlyout && document.getElementById(`${base}-${openFlyout}-toggle`);
    if (!panel || !anchor) return;
    const run = () => placeElement(panel, anchor.getBoundingClientRect(), 'right', 'start', 6);
    run();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    return () => {
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
    };
  }, [base, openFlyout]);

  useEffect(() => {
    if (openFlyout) flyoutRef.current?.querySelector<HTMLElement>('.cp-sidenav__item')?.focus();
  }, [openFlyout]);

  useLayoutEffect(() => {
    if (tip && tipRef.current) placeElement(tipRef.current, tip.anchor.getBoundingClientRect(), 'right', 'start', 8);
  }, [tip]);

  const closeFlyout = () => {
    if (openFlyout) document.getElementById(toggleId(openFlyout))?.focus();
    setFlyout(null);
  };

  const toggle = (item: SideNavItem, rail: boolean) => {
    if (rail) {
      setTip(null);
      setFlyout((open) => (open === item.id ? null : item.id));
      return;
    }
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(item.id)) next.add(item.id);
      return next;
    });
  };

  // Rail items name themselves with a visually hidden label; the tooltip repeats it for sighted users.
  const tipHandlers = (item: SideNavItem, rail: boolean) =>
    rail
      ? {
          onMouseEnter: (e: { currentTarget: HTMLElement }) =>
            openFlyout !== item.id && setTip({ label: item.label, anchor: e.currentTarget }),
          onMouseLeave: () => setTip(null),
          onFocus: (e: FocusEvent<HTMLElement>) =>
            openFlyout !== item.id && setTip({ label: item.label, anchor: e.currentTarget }),
          onBlur: () => setTip(null),
        }
      : {};

  const content = (item: SideNavItem, chevron: boolean) => (
    <>
      {item.icon != null && (
        <span className="cp-sidenav__item-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="cp-sidenav__item-label">{item.label}</span>
      {item.badge}
      {chevron && (
        <span className="cp-sidenav__chevron" aria-hidden="true">
          ›
        </span>
      )}
    </>
  );

  const renderItems = (items: SideNavItem[], rail: boolean): ReactNode =>
    items.map((item) => {
      if (item.items) {
        const open = rail ? openFlyout === item.id : expanded.has(item.id);
        return (
          <div key={item.id} className="cp-sidenav__node">
            <button
              id={toggleId(item.id)}
              type="button"
              className={cx('cp-sidenav__item', path.includes(item.id) && 'is-active-parent')}
              aria-expanded={open}
              aria-controls={open ? groupId(item.id) : undefined}
              onClick={() => toggle(item, rail)}
              {...tipHandlers(item, rail)}
            >
              {content(item, true)}
            </button>
            {open && rail && (
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focusout closes the flyout once focus leaves it and its toggle; no pointer or key handling here
              <div
                ref={flyoutRef}
                id={groupId(item.id)}
                role="group"
                aria-labelledby={toggleId(item.id)}
                className="cp-sidenav__flyout"
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setFlyout(null);
                }}
              >
                <div className="cp-sidenav__flyout-title" aria-hidden="true">
                  {item.label}
                </div>
                {renderItems(item.items, false)}
              </div>
            )}
            {open && !rail && (
              <div id={groupId(item.id)} role="group" aria-labelledby={toggleId(item.id)} className="cp-sidenav__group">
                {renderItems(item.items, false)}
              </div>
            )}
          </div>
        );
      }
      const isLink = Boolean(item.as || item.href);
      const ItemComponent: ElementType = item.as ?? (isLink ? 'a' : 'button');
      return (
        <ItemComponent
          key={item.id}
          {...(isLink ? { href: item.href } : { type: 'button' })}
          className={cx('cp-sidenav__item', activeId === item.id && 'is-active')}
          aria-current={activeId === item.id ? 'page' : undefined}
          onClick={() => {
            onSelect?.(item.id, item);
            if (openFlyout) closeFlyout();
          }}
          {...tipHandlers(item, rail)}
          {...item.linkProps}
        >
          {content(item, false)}
        </ItemComponent>
      );
    });

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!(e.target instanceof HTMLElement) || !e.target.classList.contains('cp-sidenav__item')) return;
    const target = e.target;
    // The flyout is its own list: arrows stay inside it, and the rail skips its items.
    const scope = target.closest('.cp-sidenav__flyout');
    const visible = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.cp-sidenav__item')).filter(
      (el) => el.closest('.cp-sidenav__flyout') === scope,
    );
    if (moveRovingFocus(e, visible, 'vertical') >= 0) return;

    const state = target.getAttribute('aria-expanded');
    const container = target.parentElement?.closest('.cp-sidenav__group, .cp-sidenav__flyout');
    if (e.key === 'ArrowRight' && state === 'false') {
      e.preventDefault();
      target.click();
    } else if (
      e.key === 'ArrowRight' &&
      state === 'true' &&
      !target.nextElementSibling?.matches('.cp-sidenav__flyout')
    ) {
      e.preventDefault();
      target.nextElementSibling?.querySelector<HTMLElement>('.cp-sidenav__item')?.focus();
    } else if (e.key === 'ArrowLeft' && state === 'true' && !scope && !collapsed) {
      e.preventDefault();
      target.click();
    } else if (e.key === 'ArrowLeft' && container?.matches('.cp-sidenav__group')) {
      e.preventDefault();
      if (container.previousElementSibling instanceof HTMLElement) container.previousElementSibling.focus();
    } else if ((e.key === 'ArrowLeft' && scope) || (e.key === 'Escape' && openFlyout)) {
      e.preventDefault();
      closeFlyout();
    }
  };

  return (
    <nav className={cx('cp-sidenav', collapsed && 'cp-sidenav--collapsed', className)} {...rest}>
      {brand != null && <div className="cp-sidenav__brand">{brand}</div>}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- delegated arrow keys for the items inside; each item is its own focusable control */}
      <div className="cp-sidenav__sections" onKeyDown={onKeyDown}>
        {sections.map((section, si) => (
          <div key={si} className="cp-sidenav__section">
            {section.title != null && <div className="cp-sidenav__section-title">{section.title}</div>}
            {renderItems(section.items, collapsed)}
          </div>
        ))}
      </div>
      {footer != null && <div className="cp-sidenav__footer">{footer}</div>}
      {collapsed && tip && (
        <div ref={tipRef} className="cp-sidenav__tip" aria-hidden="true">
          {tip.label}
        </div>
      )}
    </nav>
  );
}
