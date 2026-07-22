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

/** Corpo status bar — a row of mono label/value readouts, e.g. a footer system-status strip. */
export function StatusBar({ items, className, ...rest }: StatusBarProps) {
  return (
    <div className={cn('cp-status-bar', className)} {...rest}>
      {items.map((item) => (
        <span key={item.id} className="cp-status-bar__item">
          <span className="cp-status-bar__label">{item.label}</span>
          <span className="cp-status-bar__value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
