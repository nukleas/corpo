import { useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { MenuList } from '../lib/MenuList';
import { moveRovingFocus } from '../lib/roving';
import type { MenuItem } from '../lib/types';

export interface MenubarMenu {
  id: string;
  label: ReactNode;
  items: MenuItem[];
}

export interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  menus: MenubarMenu[];
}

/**
 * Corpo menubar — a row of menus, as in a desktop app's File / Edit / View.
 * One tab stop; ArrowLeft/ArrowRight move along the bar (and between open
 * menus), ArrowDown or Enter opens a menu, Escape closes it. Once a menu is
 * open, hovering another title switches to it. Give it an `aria-label`.
 */
export function Menubar({ menus, className, ...rest }: MenubarProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [open, setOpen] = useState<{ index: number; focus: 'first' | 'last' } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  const openAt = (index: number, focus: 'first' | 'last' = 'first') => {
    setFocusIndex(index);
    setOpen({ index, focus });
  };
  const close = (returnFocus: boolean) => {
    if (returnFocus && open) triggers.current[open.index]?.focus();
    setOpen(null);
  };

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent) => {
    if (!open || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    openAt((open.index + step + menus.length) % menus.length);
  };

  return (
    <div ref={root} role="menubar" className={cn('cp-menubar', className)} {...rest}>
      {menus.map((m, i) => {
        const isOpen = open?.index === i;
        return (
          <div key={m.id} className="cp-menubar__menu">
            <button
              ref={(el) => {
                triggers.current[i] = el;
              }}
              id={`${base}-trigger-${i}`}
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={isOpen ? `${base}-menu-${i}` : undefined}
              tabIndex={i === focusIndex ? 0 : -1}
              className="cp-menubar__trigger"
              onClick={() => (isOpen ? setOpen(null) : openAt(i))}
              onMouseEnter={() => {
                if (open && !isOpen) openAt(i);
              }}
              onKeyDown={(e) => {
                const next = moveRovingFocus(e, triggers.current);
                if (next >= 0) {
                  setFocusIndex(next);
                  if (open) openAt(next);
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  openAt(i, e.key === 'ArrowDown' ? 'first' : 'last');
                }
              }}
            >
              {m.label}
            </button>
            {isOpen && (
              <MenuList
                key={i}
                id={`${base}-menu-${i}`}
                labelledBy={`${base}-trigger-${i}`}
                items={m.items}
                initialFocus={open.focus}
                onClose={close}
                onKeyDown={onMenuKeyDown}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
