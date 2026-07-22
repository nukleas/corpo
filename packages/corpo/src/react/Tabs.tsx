import { useState, type HTMLAttributes, type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  count?: number;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  active?: string;
  defaultActive?: string;
  onChange?: (id: string) => void;
  pills?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Tabs({ tabs, active, defaultActive, onChange, pills = false, className = '', ...rest }: TabsProps) {
  const [internal, setInternal] = useState(defaultActive ?? tabs[0]?.id);
  const current = active !== undefined ? active : internal;

  return (
    <div role="tablist" className={cx('cp-tabs', pills && 'cp-tabs--pills', className)} {...rest}>
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
