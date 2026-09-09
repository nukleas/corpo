import { isValidElement } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { createShorthandFactory } from '../lib/createShorthand';
import type { Shorthand } from '../lib/createShorthand';

export interface AmountProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The signed numeric value. */
  value: number;
  /**
   * Negative rendering — parentheses for print/ledger contexts, red (with a
   * minus sign, so color is never the only indicator) for live screens.
   * Never combine parentheses and red.
   * @default 'paren'
   */
  negative?: 'paren' | 'minus' | 'red';
  /** Hanging currency symbol, flush left of the slot (Excel accounting style). Omit for bare figures. */
  currency?: string;
  /** Render exact zero as a muted dash. @default true */
  zeroDash?: boolean;
  /** Fraction digits. @default 2 */
  decimals?: number;
}

/**
 * Accounting-formatted money figure — mono, tabular nums, decimal-aligned.
 * In `paren` mode non-negative values are end-padded one character so decimals
 * align with parenthesized negatives in the same column. Every money slot in
 * the accounting family accepts {@link AmountShorthand}: a bare number, a
 * props object, or an `<Amount>` element.
 */
export function Amount({
  value,
  negative = 'paren',
  currency,
  zeroDash = true,
  decimals = 2,
  className,
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
      className={cn(
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

/** Normalizes money shorthand — `12_400` / `{ value, negative }` / element — to an {@link Amount}. */
Amount.create = createShorthandFactory<AmountProps, number>(Amount, (value) => ({ value }));

/** Shorthand accepted by the accounting family's money slots. */
export type AmountShorthand = Shorthand<AmountProps, number>;

/** Reads the numeric value out of money shorthand; `undefined` when it has none. */
export function amountValue(shorthand: AmountShorthand): number | undefined {
  if (shorthand == null || shorthand === true || shorthand === false) return undefined;
  // SAFETY: shorthand-shape classification, same contract as createShorthandFactory —
  // a bare primitive is the value itself; an element's value lives in its props;
  // a remaining object is a Partial<AmountProps> whose `value` may be set.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
  if (typeof shorthand === 'number') return shorthand;
  if (isValidElement(shorthand)) {
    // SAFETY: an element in an AmountShorthand slot is an <Amount>, so its
    // props are Partial<AmountProps>; the number check below still guards it.
    const v = (shorthand.props as Partial<AmountProps>).value;
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- boundary shape classification (see above)
    return typeof v === 'number' ? v : undefined;
  }
  return shorthand.value;
}
