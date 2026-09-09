import { Fragment } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount, amountValue } from './Amount';
import type { AmountShorthand } from './Amount';

export interface LedgerSplit {
  /** Posting line description, indented under the transaction row. */
  memo: ReactNode;
  debit?: AmountShorthand;
  credit?: AmountShorthand;
}

export interface LedgerEntry {
  date?: ReactNode;
  memo: ReactNode;
  /** Folio / reference column. */
  ref?: ReactNode;
  debit?: AmountShorthand;
  credit?: AmountShorthand;
  /** Explicit balance; omitted → computed as running opening + Dr − Cr (debit-normal). */
  balance?: AmountShorthand;
  /** Static indented posting sub-rows for a multi-posting transaction. */
  splits?: LedgerSplit[];
}

export interface LedgerProps extends HTMLAttributes<HTMLDivElement> {
  entries: LedgerEntry[];
  /** Opening balance — renders the opening row and seeds the running balance. */
  opening?: number;
  /** Green-bar zebra (3-row bands) for row tracking. @default false */
  bar?: boolean;
  /** Period-total footer row (Σ Dr, Σ Cr). @default true */
  totals?: boolean;
}

/**
 * Accounting register — Date · Memo · Ref · Dr · Cr · Balance on the
 * `cp-table` chassis. Computes the running balance debit-normal from
 * `opening` unless an entry carries its own `balance`; the computation only
 * sees numeric shorthands (a bare number or `{ value }`), so element
 * shorthands should bring explicit balances. Dr/Cr negatives render in
 * parentheses; balance negatives in red.
 */
export function Ledger({ entries, opening, bar = false, totals = true, className, ...rest }: LedgerProps) {
  let running = opening ?? 0;
  let totalDr = 0;
  let totalCr = 0;

  const rows = entries.map((entry, i) => {
    const dr = amountValue(entry.debit) ?? 0;
    const cr = amountValue(entry.credit) ?? 0;
    totalDr += dr;
    totalCr += cr;
    running = amountValue(entry.balance) ?? running + dr - cr;
    return (
      // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
      <Fragment key={i}>
        <tr>
          <td data-mono="true">{entry.date}</td>
          <td>{entry.memo}</td>
          <td data-mono="true">{entry.ref}</td>
          <td data-numeric="true">{Amount.create(entry.debit)}</td>
          <td data-numeric="true">{Amount.create(entry.credit)}</td>
          <td data-numeric="true" className="cp-ledger__balance">
            {Amount.create(entry.balance ?? running, { defaultProps: { negative: 'red' } })}
          </td>
        </tr>
        {entry.splits?.map((split, si) => (
          // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
          <tr key={`${i}:${si}`} className="cp-ledger__row--split">
            <td />
            <td>{split.memo}</td>
            <td />
            <td data-numeric="true">{Amount.create(split.debit)}</td>
            <td data-numeric="true">{Amount.create(split.credit)}</td>
            <td />
          </tr>
        ))}
      </Fragment>
    );
  });

  return (
    <div
      className={cn('cp-table', 'cp-table--compact', 'cp-ledger', bar && 'cp-ledger--bar', className)}
      {...rest}
    >
      <table className="cp-table__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Memo</th>
            <th>Ref</th>
            <th data-numeric="true">Dr</th>
            <th data-numeric="true">Cr</th>
            <th data-numeric="true">Balance</th>
          </tr>
        </thead>
        <tbody>
          {opening != null && (
            <tr className="cp-ledger__row--opening">
              <td />
              <td>Opening balance</td>
              <td />
              <td data-numeric="true" />
              <td data-numeric="true" />
              <td data-numeric="true" className="cp-ledger__balance">
                {Amount.create(opening, { defaultProps: { negative: 'red' } })}
              </td>
            </tr>
          )}
          {rows}
          {totals && (
            <tr className="cp-foot cp-foot--total">
              <td />
              <td>Totals</td>
              <td />
              <td data-numeric="true">{Amount.create(totalDr)}</td>
              <td data-numeric="true">{Amount.create(totalCr)}</td>
              <td data-numeric="true" className="cp-ledger__balance">
                {Amount.create(running, { defaultProps: { negative: 'red' } })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
