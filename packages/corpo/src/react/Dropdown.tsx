import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent,
  type KeyboardEvent,
} from 'react';
import { cx } from './cx';
import { MenuList, type MenuCloseReason } from './MenuList';
import type { MenuItem } from './MenuList';

interface TriggerProps {
  id?: string;
  'aria-haspopup'?: 'menu';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface DropdownProps {
  /** The button that opens the menu — one element; it receives `aria-expanded` and focus on close. */
  trigger: ReactElement<TriggerProps>;
  items: MenuItem[];
  /** Menu alignment relative to the trigger. @default 'left' */
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Corpo dropdown menu — a menu button. Click, Enter, Space or ArrowDown opens
 * it on the first item (ArrowUp: the last); arrows move between items; Escape
 * or choosing an item closes it and returns focus to the trigger.
 */
export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState<false | 'first' | 'last'>(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const fallbackId = useId();
  const triggerId = trigger.props.id ?? fallbackId;

  const close = (reason: MenuCloseReason) => {
    setOpen(false);
    const triggerEl = ref.current?.firstElementChild;
    if (reason !== 'tab' && triggerEl instanceof HTMLElement) triggerEl.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className={cx('cp-dropdown', className)}>
      {cloneElement<TriggerProps>(trigger, {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': open !== false,
        'aria-controls': open ? menuId : undefined,
        onClick: (e: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(e);
          setOpen((v) => (v ? false : 'first'));
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          trigger.props.onKeyDown?.(e);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(e.key === 'ArrowDown' ? 'first' : 'last');
          }
        },
      })}
      {open && (
        <MenuList
          id={menuId}
          labelledBy={triggerId}
          items={items}
          initialFocus={open}
          className={cx(align === 'right' && 'cp-dropdown__menu--right')}
          onClose={close}
        />
      )}
    </div>
  );
}
