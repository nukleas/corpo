import type { HTMLAttributes, ReactNode } from 'react';

export interface StatusBarItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  items: StatusBarItem[];
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function StatusBar({ items, className = '', ...rest }: StatusBarProps) {
  return (
    <div className={cx('cp-status-bar', className)} {...rest}>
      {items.map((item) => (
        <span key={item.id} className="cp-status-bar__item">
          <span className="cp-status-bar__label">{item.label}</span>
          <span className="cp-status-bar__value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
