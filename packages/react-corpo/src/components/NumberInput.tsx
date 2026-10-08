import { useState } from 'react';
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useFieldControlProps } from '../lib/field-context';

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'prefix'
> {
  /** The number, or `null` when the field is empty. */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Fixed fraction digits — the value is rounded to them on blur and shown padded. Omit for free precision. */
  decimals?: number;
  min?: number;
  max?: number;
  /** ArrowUp/ArrowDown increment (Shift ×10). @default 1 */
  step?: number;
  /** Addon before the field, e.g. a currency symbol. */
  prefix?: ReactNode;
  /** Addon after the field, e.g. a unit or `%`. */
  suffix?: ReactNode;
  /** Control height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Error state — red border. @default false */
  error?: boolean;
}

// Digits with optional grouping commas, one optional point, optional leading minus.
const PARTIAL = /^-?[\d,]*\.?\d*$/;

function parse(text: string): number | null {
  const n = Number(text.replaceAll(',', ''));
  return text.trim() === '' || Number.isNaN(n) ? null : n;
}

function format(value: number, decimals: number | undefined): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  });
}

/**
 * Corpo number input — right-aligned tabular figures, grouped (`12,400.00`)
 * while idle and raw while editing. Rejects non-numeric keystrokes, steps with
 * the arrow keys, and clamps to `min`/`max` and rounds to `decimals` on blur.
 * `prefix`/`suffix` render as {@link InputGroup}-style addons.
 */
export function NumberInput({
  value,
  onChange,
  decimals,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  size = 'md',
  error = false,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...rest
}: NumberInputProps) {
  // Raw text while focused; null while idle, when the formatted value shows.
  const [draft, setDraft] = useState<string | null>(null);
  const fieldProps = useFieldControlProps(error);

  const settle = (n: number) => {
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
    if (decimals === undefined) return clamped;
    const f = 10 ** decimals;
    return Math.round(clamped * f) / f;
  };

  const stepBy = (e: KeyboardEvent<HTMLInputElement>, dir: 1 | -1) => {
    e.preventDefault();
    const next = settle((value ?? 0) + dir * step * (e.shiftKey ? 10 : 1));
    onChange(next);
    setDraft(String(next));
  };

  const input = (
    <input
      {...fieldProps}
      type="text"
      inputMode={decimals === 0 ? 'numeric' : 'decimal'}
      role="spinbutton"
      aria-valuenow={value ?? undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      className={cn(
        'cp-input',
        'cp-input--numeric',
        size !== 'md' && `cp-input--${size}`,
        error && 'cp-input--error',
        className,
      )}
      value={draft ?? (value == null ? '' : format(value, decimals))}
      onFocus={(e) => {
        setDraft(value == null ? '' : String(value));
        onFocus?.(e);
      }}
      onChange={(e) => {
        const text = e.target.value;
        if (!PARTIAL.test(text)) return;
        setDraft(text);
        onChange(parse(text));
      }}
      onBlur={(e) => {
        const n = parse(draft ?? '');
        const settled = n == null ? null : settle(n);
        if (settled !== value) onChange(settled);
        setDraft(null);
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') stepBy(e, 1);
        else if (e.key === 'ArrowDown') stepBy(e, -1);
        onKeyDown?.(e);
      }}
      {...rest}
    />
  );

  if (prefix == null && suffix == null) return input;
  return (
    <div className="cp-input-group">
      {prefix != null && <span className="cp-input-group__addon cp-input-group__addon--leading">{prefix}</span>}
      {input}
      {suffix != null && <span className="cp-input-group__addon cp-input-group__addon--trailing">{suffix}</span>}
    </div>
  );
}
