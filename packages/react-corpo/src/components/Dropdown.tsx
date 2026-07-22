import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface DropdownItem {
  id: string;
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Renders in red — use for destructive actions. */
  danger?: boolean;
}

export interface DropdownProps {
  /** Element that opens the menu on click. */
  trigger: ReactNode;
  items: DropdownItem[];
  /** Menu alignment relative to the trigger. @default 'left' */
  align?: 'left' | 'right';
  className?: string;
}

/** Corpo dropdown menu — click-triggered, closes on outside click. */
export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className={cn('cp-dropdown', className)}>
      <span onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && (
        <div className={cn('cp-dropdown__menu', align === 'right' && 'cp-dropdown__menu--right')} role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cn('cp-dropdown__item', item.danger && 'cp-dropdown__item--danger')}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
