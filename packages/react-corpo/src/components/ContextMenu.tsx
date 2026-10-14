import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MenuList } from '../lib/MenuList';
import type { MenuItem } from '../lib/types';

export interface ContextMenuProps {
  items: MenuItem[];
  /** The region that opens the menu — a row, card or canvas. */
  children: ReactNode;
  /** Names the menu for assistive tech. @default 'Actions' */
  label?: string;
}

/**
 * Corpo context menu — right-click, or Shift+F10 / the Menu key on a focused
 * element inside, opens a {@link Dropdown}-style menu at the pointer. It is a
 * shortcut: keep every action reachable another way too.
 */
export function ContextMenu({ items, children, label = 'Actions' }: ContextMenuProps) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const menuId = useId();

  const close = (returnFocus: boolean) => {
    setAt(null);
    if (returnFocus) opener.current?.focus();
  };

  // Keep the menu inside the viewport — it has to be measured after mount, so the node is moved directly.
  useLayoutEffect(() => {
    if (!at) return;
    const el = document.getElementById(menuId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.left = `${Math.max(4, Math.min(at.x, window.innerWidth - r.width - 4))}px`;
    el.style.top = `${Math.max(4, Math.min(at.y, window.innerHeight - r.height - 4))}px`;
  }, [at, menuId]);

  useEffect(() => {
    if (!at) return;
    const onDocDown = (e: MouseEvent) => {
      const el = document.getElementById(menuId);
      if (el && e.target instanceof Node && !el.contains(e.target)) setAt(null);
    };
    const onScroll = () => setAt(null);
    document.addEventListener('mousedown', onDocDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [at, menuId]);

  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- catches contextmenu and Shift+F10 bubbling from the focusable content inside; the wrapper is display: contents
    <div
      className="cp-context-menu"
      onContextMenu={(e) => {
        e.preventDefault();
        if (e.target instanceof Node && document.getElementById(menuId)?.contains(e.target)) return;
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onKeyDown={(e) => {
        if (at || !((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu')) return;
        if (!(e.target instanceof HTMLElement)) return;
        e.preventDefault();
        opener.current = e.target;
        const r = e.target.getBoundingClientRect();
        setAt({ x: r.left, y: r.bottom });
      }}
    >
      {children}
      {at &&
        createPortal(
          <MenuList
            id={menuId}
            items={items}
            label={label}
            className="cp-dropdown__menu--fixed"
            style={{ left: at.x, top: at.y }}
            onClose={close}
          />,
          document.body,
        )}
    </div>
  );
}
