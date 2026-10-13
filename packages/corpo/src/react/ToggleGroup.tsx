import { useState, type ReactNode } from 'react';
import { cx } from './cx';
import { moveRovingFocus } from './roving';
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
  /** Names the group, e.g. "View". */
  'aria-label'?: string;
  className?: string;
}

/**
 * Corpo toggle group — a segmented single- or multi-select control built from
 * {@link Toggle}. One tab stop: arrow keys and Home/End move focus between
 * options, Space or Enter toggles.
 */
export function ToggleGroup({
  options,
  value,
  onChange,
  multiple = false,
  'aria-label': ariaLabel,
  className,
}: ToggleGroupProps) {
  const values = Array.isArray(value) ? value : [value];
  const [focused, setFocused] = useState<number | null>(null);
  const stop =
    focused ??
    Math.max(
      0,
      options.findIndex((o) => values.includes(o.value)),
    );

  const toggle = (v: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };

  return (
    <div className={cx('cp-toggle-group', className)} role="group" aria-label={ariaLabel}>
      {options.map((o, i) => (
        <Toggle
          key={o.value}
          pressed={values.includes(o.value)}
          onPressedChange={() => toggle(o.value)}
          tabIndex={i === stop ? 0 : -1}
          onFocus={() => setFocused(i)}
          onKeyDown={(e) => {
            const siblings = Array.from(e.currentTarget.parentElement?.children ?? []);
            moveRovingFocus(
              e,
              siblings.filter((el) => el instanceof HTMLElement),
            );
          }}
        >
          {o.label}
        </Toggle>
      ))}
    </div>
  );
}
