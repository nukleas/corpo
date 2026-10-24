import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cn } from './cn';
import { placeElement, type PlaceAlign, type PlaceSide } from './place';
import { moveRovingFocus } from './roving';
import type { MenuItem } from './types';

/** Why a menu closed: `select` ran an item, `escape` backs out one level, `tab` lets focus move on. */
export type MenuCloseReason = 'select' | 'escape' | 'tab';

export interface MenuListProps {
  id?: string;
  items: MenuItem[];
  /** `id` of the element that names the menu — its trigger. */
  labelledBy?: string;
  /** Accessible name when there is no trigger to point at. */
  label?: string;
  /** Item focused when the menu mounts; `none` when a submenu opens on hover. @default 'first' */
  initialFocus?: 'first' | 'last' | 'none';
  className?: string;
  style?: CSSProperties;
  onClose: (reason: MenuCloseReason) => void;
  /** Keys the menu leaves alone — the menubar handles ArrowLeft/ArrowRight here. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** A submenu: ArrowLeft closes it like Escape. */
  nested?: boolean;
  /**
   * Anchor the menu to its parent (the trigger's wrapper) and flip or shift
   * it so it stays inside the viewport. Submenus do this on their own.
   */
  place?: boolean;
  /** Cross-axis alignment against the anchor. @default 'start' */
  placeAlign?: PlaceAlign;
  /** Preferred side. Submenus open to the right and flip left. @default 'bottom' */
  placeSide?: PlaceSide;
  /** Gap between the anchor and the menu, in px. @default 4 */
  placeGap?: number;
}

/**
 * The menu panel shared by Dropdown, ContextMenu and Menubar: `cp-dropdown__menu`
 * with the WAI-ARIA menu keyboard model — focus moves into the menu on mount,
 * ArrowUp/ArrowDown/Home/End move between enabled items, Escape and Tab close.
 * Submenus open with ArrowRight, Enter or hover and close with ArrowLeft or
 * Escape; checkbox and radio items toggle without closing the menu.
 */
export function MenuList({
  id,
  items,
  labelledBy,
  label,
  initialFocus = 'first',
  className,
  style,
  onClose,
  onKeyDown,
  nested = false,
  place = false,
  placeAlign = 'start',
  placeSide = 'bottom',
  placeGap = 4,
}: MenuListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<{ id: string; focus: 'first' | 'none' } | null>(null);
  const base = useId();
  // In a menu with checkable items every label sits after the check slot, so the column lines up.
  const checkable = items.some((item) => item.type === 'checkbox' || item.type === 'radio');
  const slot = checkable && <span className="cp-dropdown__check" aria-hidden="true" />;

  useEffect(() => {
    if (initialFocus === 'none') return;
    const enabled = refs.current.filter((el) => el && !el.disabled);
    (initialFocus === 'last' ? enabled[enabled.length - 1] : enabled[0])?.focus();
  }, [initialFocus]);

  // Parent is the trigger wrapper: the menu itself is absolutely positioned, so it
  // does not stretch that box. Fixed coordinates then escape overflow clipping.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const anchor = menu?.parentElement;
    if (!menu || !anchor || anchor === document.body || !(place || nested)) return;
    const side = nested ? 'right' : placeSide;
    const run = () => placeElement(menu, anchor.getBoundingClientRect(), side, placeAlign, placeGap);
    run();
    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, true);
    return () => {
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run, true);
    };
  }, [place, nested, placeAlign, placeSide, placeGap]);

  return (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn('cp-dropdown__menu', nested && 'cp-dropdown__menu--sub', className)}
      style={style}
    >
      {items.map((item, i) => {
        if (item.type === 'separator') {
          return <div key={item.id} role="separator" className="cp-dropdown__separator" />;
        }
        const ref = (el: HTMLButtonElement | null) => {
          refs.current[i] = el;
        };
        const onItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
          if (moveRovingFocus(e, refs.current, 'vertical') >= 0) return;
          if (item.type === 'submenu' && e.key === 'ArrowRight') {
            e.preventDefault();
            setSub({ id: item.id, focus: 'first' });
          } else if (e.key === 'Escape' || (nested && e.key === 'ArrowLeft')) {
            e.preventDefault();
            e.stopPropagation();
            onClose('escape');
          } else if (e.key === 'Tab') {
            onClose('tab');
          } else {
            onKeyDown?.(e);
          }
        };
        // Moving the pointer onto another item closes an open submenu.
        const onMouseEnter = () => {
          if (item.type === 'submenu') setSub({ id: item.id, focus: 'none' });
          else setSub(null);
        };

        if (item.type === 'submenu') {
          const open = sub?.id === item.id;
          return (
            <div key={item.id} className="cp-dropdown__sub">
              <button
                ref={ref}
                id={`${base}-${i}`}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={item.disabled}
                className="cp-dropdown__item"
                onClick={() => setSub({ id: item.id, focus: 'first' })}
                onKeyDown={onItemKeyDown}
                onMouseEnter={onMouseEnter}
              >
                {slot}
                {item.label}
                <span className="cp-dropdown__chevron" aria-hidden="true">
                  ›
                </span>
              </button>
              {open && (
                <MenuList
                  items={item.items}
                  labelledBy={`${base}-${i}`}
                  initialFocus={sub.focus}
                  nested
                  onKeyDown={onKeyDown}
                  onClose={(reason) => {
                    setSub(null);
                    if (reason === 'escape') refs.current[i]?.focus();
                    else onClose(reason);
                  }}
                />
              )}
            </div>
          );
        }

        if (item.type === 'checkbox' || item.type === 'radio') {
          return (
            <button
              key={item.id}
              ref={ref}
              type="button"
              role={item.type === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio'}
              tabIndex={-1}
              aria-checked={item.checked}
              disabled={item.disabled}
              className="cp-dropdown__item"
              onClick={() => item.onCheckedChange(item.type === 'radio' ? true : !item.checked)}
              onKeyDown={onItemKeyDown}
              onMouseEnter={onMouseEnter}
            >
              <span className="cp-dropdown__check" aria-hidden="true">
                {item.checked ? '✓' : ''}
              </span>
              {item.label}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            ref={ref}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={item.disabled}
            className={cn('cp-dropdown__item', item.danger && 'cp-dropdown__item--danger')}
            onClick={() => {
              item.onClick?.();
              onClose('select');
            }}
            onKeyDown={onItemKeyDown}
            onMouseEnter={onMouseEnter}
          >
            {slot}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
