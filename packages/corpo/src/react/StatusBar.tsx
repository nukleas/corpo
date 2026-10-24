import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface StatusBarItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  items: StatusBarItem[];
}

export function StatusBar({ items, className = '', ...rest }: StatusBarProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scroll container must be focusable for keyboard scrolling (WCAG 2.1.1)
    <div className={cx('cp-status-bar', className)} tabIndex={0} {...rest}>
      {items.map((item) => (
        <span key={item.id} className="cp-status-bar__item">
          <span className="cp-status-bar__label">{item.label}</span>
          <span className="cp-status-bar__value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
