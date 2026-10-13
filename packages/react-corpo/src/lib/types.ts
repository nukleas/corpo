import type { ReactNode } from 'react';

/**
 * Accent theme applied via `.theme-*` on a root element
 * (typically `<html>` or {@link ThemeProvider}). `teal` is the default and
 * needs no class of its own.
 */
export type CpTheme = 'teal' | 'amber' | 'green' | 'red' | 'steel';

/** Semantic color family used by Badge/Progress status treatments. */
export type CpColor = 'neutral' | 'accent' | 'green' | 'red' | 'amber' | 'blue' | 'magenta' | 'purple';

/** Shared size scale used by form controls and buttons. */
export type CpSize = 'sm' | 'md' | 'lg';

interface MenuEntryBase {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

/**
 * One entry in a {@link Dropdown}, {@link ContextMenu} or {@link Menubar}
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
