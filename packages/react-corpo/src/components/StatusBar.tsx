import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface StatusBarItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  items: StatusBarItem[];
}

/**
 * Corpo status bar — a row of mono label/value readouts, e.g. a footer
 * system-status strip. The bar is `min-width: 0` and scrolls horizontally
 * inside itself. An edge fade appears only when the items overflow, so a long
 * strip never widens the page. The bar is a tab stop so a keyboard user can
 * scroll it when the items overflow.
 */
export function StatusBar({ items, className, ...rest }: StatusBarProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll container must be focusable for keyboard scrolling (WCAG 2.1.1)
    <div className={cn('cp-status-bar', className)} tabIndex={0} {...rest}>
      {items.map((item) => (
        <span key={item.id} className="cp-status-bar__item">
          <span className="cp-status-bar__label">{item.label}</span>
          <span className="cp-status-bar__value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
