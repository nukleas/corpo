import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  /** Optional count chip. */
  count?: number;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  /** Controlled active tab id. */
  active?: string;
  /** Uncontrolled initial tab id. */
  defaultActive?: string;
  onChange?: (id: string) => void;
  /** Bordered pill triggers instead of an underline. @default false */
  pills?: boolean;
}

/** Corpo tab strip — mono uppercase triggers, 2px accent underline (or pills). */
export function Tabs({ tabs, active, defaultActive, onChange, pills = false, className, ...rest }: TabsProps) {
  const [internal, setInternal] = useState(defaultActive ?? tabs[0]?.id);
  const current = active !== undefined ? active : internal;

  return (
    <div role="tablist" className={cn('cp-tabs', pills && 'cp-tabs--pills', className)} {...rest}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === current}
          className="cp-tabs__tab"
          onClick={() => {
            setInternal(t.id);
            onChange?.(t.id);
          }}
        >
          {t.label}
          {t.count !== undefined && <span className="cp-tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
