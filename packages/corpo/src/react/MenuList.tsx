import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './cx';
import { moveRovingFocus } from './roving';

/** One action in a Dropdown menu. */
export interface MenuItem {
  id: string;
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Renders in red — use for destructive actions. */
  danger?: boolean;
}

export interface MenuListProps {
  id?: string;
  items: MenuItem[];
  /** `id` of the element that names the menu — its trigger. */
  labelledBy?: string;
  /** Accessible name when there is no trigger to point at. */
  label?: string;
  /** Item focused when the menu mounts. @default 'first' */
  initialFocus?: 'first' | 'last';
  className?: string;
  style?: CSSProperties;
  /**
   * Called on Escape, Tab, or after an item runs. `returnFocus` is false for
   * Tab, where focus moves on by itself.
   */
  onClose: (returnFocus: boolean) => void;
  /** Keys the menu leaves alone — the menubar handles ArrowLeft/ArrowRight here. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * The menu panel shared by Dropdown, ContextMenu and Menubar: `cp-dropdown__menu`
 * with the WAI-ARIA menu keyboard model — focus moves into the menu on mount,
 * ArrowUp/ArrowDown/Home/End move between enabled items, Escape and Tab close.
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
}: MenuListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const enabled = refs.current.filter((el) => el && !el.disabled);
    (initialFocus === 'last' ? enabled[enabled.length - 1] : enabled[0])?.focus();
  }, [initialFocus]);

  return (
    <div
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cx('cp-dropdown__menu', className)}
      style={style}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="menuitem"
          tabIndex={-1}
          disabled={item.disabled}
          className={cx('cp-dropdown__item', item.danger && 'cp-dropdown__item--danger')}
          onClick={() => {
            item.onClick?.();
            onClose(true);
          }}
          onKeyDown={(e) => {
            if (moveRovingFocus(e, refs.current, 'vertical') >= 0) return;
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onClose(true);
            } else if (e.key === 'Tab') {
              onClose(false);
            } else {
              onKeyDown?.(e);
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
