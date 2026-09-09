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
  const figure = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const text =
    isZero && zeroDash ? '–'
      : !isNegative ? figure
        : negative === 'paren' ? `(${figure})`
          : `−${figure}`;
  return (
    <span
      className={cx(
        'cp-amount',
        currency != null && 'cp-amount--split',
        negative === 'paren' && !isNegative && 'cp-amount--pad',
        negative === 'red' && isNegative && 'cp-amount--red',
        isZero && zeroDash && 'cp-amount--zero',
        className,
      )}
      {...rest}
    >
      {currency != null && <span className="cp-amount__currency">{currency}</span>}
      <span className="cp-amount__value">{text}</span>
    </span>
  );
}
