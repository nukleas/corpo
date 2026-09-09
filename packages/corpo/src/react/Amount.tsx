import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface AmountProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The signed numeric value. */
  value: number;
  /** Negative rendering — parens (print/ledger), minus, or red with a minus sign. @default 'paren' */
  negative?: 'paren' | 'minus' | 'red';
  /** Hanging currency symbol, flush left of the slot. Omit for bare figures. */
  currency?: string;
  /** Render exact zero as a muted dash. @default true */
  zeroDash?: boolean;
  /** Fraction digits. @default 2 */
  decimals?: number;
}

/** Accounting-formatted money figure — mono, tabular nums, decimal-aligned. */
export function Amount({
  value,
  negative = 'paren',
  currency,
  zeroDash = true,
  decimals = 2,
  className = '',
  ...rest
}: AmountProps) {
  const isZero = value === 0;
  const isNegative = value < 0;
  const dashed = isZero && zeroDash;
  const figure = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const text =
    dashed ? '–'
      : !isNegative ? figure
        : negative === 'paren' ? `(${figure})`
          : `−${figure}`;
  // The dash sits on the units digit: an invisible spacer stands in for the
  // fraction part and the paren-alignment slot.
  const ghost = dashed
    ? (decimals > 0 ? `.${'0'.repeat(decimals)}` : '') + (negative === 'paren' ? ')' : '')
    : '';
  return (
    <span
      className={cx(
        'cp-amount',
        currency != null && 'cp-amount--split',
        negative === 'paren' && !isNegative && !dashed && 'cp-amount--pad',
        negative === 'red' && isNegative && 'cp-amount--red',
        dashed && 'cp-amount--zero',
        className,
      )}
      {...rest}
    >
      {currency != null && <span className="cp-amount__currency">{currency}</span>}
      <span className="cp-amount__value">
        {text}
        {ghost && <span className="cp-amount__ghost" aria-hidden="true">{ghost}</span>}
      </span>
    </span>
  );
}

/** Rounds to cents — the family's one rounding rule, applied at every accumulation point. */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}
