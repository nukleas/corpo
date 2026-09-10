import { Fragment, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount, amountValue, roundCents } from './Amount';
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
  /** Split postings for a multi-posting transaction — collapsed behind a disclosure toggle. */
  splits?: LedgerSplit[];
}

export interface LedgerProps extends HTMLAttributes<HTMLDivElement> {
  entries: LedgerEntry[];
  /** Opening balance — seeds the running balance and renders the brought-forward row (also how a continued register carries a prior close). */
  opening?: number;
  /** Green-bar zebra (3-row bands) for row tracking. @default false */
  bar?: boolean;
  /** Period-total footer row (Σ Dr, Σ Cr). @default true */
  totals?: boolean;
}

/**
 * Accounting register — Date · Memo · Ref · Dr · Cr · Balance on the
 * `cp-table` chassis. Computes the running balance debit-normal from
 * `opening` unless an entry carries its own `balance`; every shorthand form
 * (bare number, `{ value }`, `<Amount>` element) feeds the computation via
 * its numeric value. Dr/Cr negatives render in
 * parentheses; balance negatives in red. Split postings start collapsed
 * behind a per-row disclosure toggle.
 */
export function Ledger({ entries, opening, bar = false, totals = true, className, ...rest }: LedgerProps) {
  const [openSplits, setOpenSplits] = useState<ReadonlySet<number>>(new Set());
  const toggleSplits = (i: number) =>
    setOpenSplits((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  let running = opening ?? 0;
  let totalDr = 0;
  let totalCr = 0;

  const rows = entries.map((entry, i) => {
    const dr = amountValue(entry.debit) ?? 0;
    const cr = amountValue(entry.credit) ?? 0;
    totalDr = roundCents(totalDr + dr);
    totalCr = roundCents(totalCr + cr);
    running = amountValue(entry.balance) ?? roundCents(running + dr - cr);
    const hasSplits = (entry.splits?.length ?? 0) > 0;
    const open = hasSplits && openSplits.has(i);
    return (
      // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
      <Fragment key={i}>
        <tr>
          <td data-mono="true">{entry.date}</td>
          <td>
            {hasSplits && (
              <button
                type="button"
                className="cp-ledger__toggle"
                aria-expanded={open}
                aria-label={`${open ? 'Collapse' : 'Expand'} split postings`}
                onClick={() => toggleSplits(i)}
              >
                {open ? '▾' : '▸'}
              </button>
            )}
            {entry.memo}
          </td>
          <td data-mono="true">{entry.ref}</td>
          <td data-numeric="true">{Amount.create(entry.debit)}</td>
          <td data-numeric="true">{Amount.create(entry.credit)}</td>
          <td data-numeric="true" className="cp-ledger__balance">
            {Amount.create(entry.balance ?? running, { defaultProps: { negative: 'red' } })}
          </td>
        </tr>
        {open &&
          entry.splits?.map((split, si) => (
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
