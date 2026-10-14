import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './cx';
import { moveRovingFocus } from './roving';

interface MenuEntryBase {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

/**
 * One entry in a Dropdown
 * menu: an action (the default), a checkbox or radio item, a submenu, or a
 * separator. Checkbox and radio items are controlled and keep the menu open.
 */
export type MenuItem =
  | (MenuEntryBase & {
      type?: 'action';
      onClick?: () => void;
      /** Renders in red — use for destructive actions. */
      danger?: boolean;
    })
  | (MenuEntryBase & { type: 'checkbox'; checked: boolean; onCheckedChange: (checked: boolean) => void })
  | (MenuEntryBase & { type: 'radio'; checked: boolean; onCheckedChange: (checked: boolean) => void })
  | (MenuEntryBase & { type: 'submenu'; items: MenuItem[] })
  | { type: 'separator'; id: string };

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
}: MenuListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
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

  return (
    <div
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cx('cp-dropdown__menu', nested && 'cp-dropdown__menu--sub', className)}
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
            className={cx('cp-dropdown__item', item.danger && 'cp-dropdown__item--danger')}
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
