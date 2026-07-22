import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Toggle } from './Toggle';

export interface ToggleGroupOption {
  value: string;
  label: ReactNode;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  /** Allow multiple options selected at once. @default false */
  multiple?: boolean;
  className?: string;
}

/** Corpo toggle group — a segmented single- or multi-select control built from {@link Toggle}. */
export function ToggleGroup({ options, value, onChange, multiple = false, className }: ToggleGroupProps) {
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
    <div className={cn('cp-toggle-group', className)} role="group">
      {options.map((o) => (
        <Toggle key={o.value} pressed={values.includes(o.value)} onPressedChange={() => toggle(o.value)}>
          {o.label}
        </Toggle>
      ))}
    </div>
  );
}
