import type { ReactNode } from 'react';
import { Toggle } from './Toggle';
import { cx } from './cx';

export interface ToggleGroupOption {
  value: string;
  label: ReactNode;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ToggleGroup({ options, value, onChange, multiple = false, className = '' }: ToggleGroupProps) {
  const values = Array.isArray(value) ? value : [value];

  const toggle = (v: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <div className={cx('cp-toggle-group', className)} role="group">
      {options.map((o) => (
        <Toggle key={o.value} pressed={values.includes(o.value)} onPressedChange={() => toggle(o.value)}>
          {o.label}
        </Toggle>
      ))}
    </div>
  );
}
