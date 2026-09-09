import { Fragment } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Amount } from './Amount';

export interface LedgerSplit {
  memo: ReactNode;
  debit?: number;
  credit?: number;
}

export interface LedgerEntry {
  date?: ReactNode;
  memo: ReactNode;
  ref?: ReactNode;
  debit?: number;
  credit?: number;
  /** Explicit balance; omitted → computed as running opening + Dr − Cr (debit-normal). */
  balance?: number;
  /** Static indented posting sub-rows. */
  splits?: LedgerSplit[];
}

export interface LedgerProps extends HTMLAttributes<HTMLDivElement> {
  entries: LedgerEntry[];
  /** Opening balance — renders the opening row and seeds the running balance. */
  opening?: number;
  /** Green-bar zebra (3-row bands). @default false */
  bar?: boolean;
  /** Period-total footer row. @default true */
  totals?: boolean;
}

/** Accounting register — Date · Memo · Ref · Dr · Cr · Balance on the cp-table chassis. */
export function Ledger({ entries, opening, bar = false, totals = true, className = '', ...rest }: LedgerProps) {
  let running = opening ?? 0;
  let totalDr = 0;
  let totalCr = 0;

  const balanceCell = (value: number) => (
    <td data-numeric="true" className="cp-ledger__balance">
      <Amount value={value} negative="red" />
    </td>
  );
  const amountCell = (value: number | undefined) => (
    <td data-numeric="true">{value != null && <Amount value={value} />}</td>
  );

  return (
    <div className={cx('cp-table', 'cp-table--compact', 'cp-ledger', bar && 'cp-ledger--bar', className)} {...rest}>
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
              {balanceCell(opening)}
            </tr>
          )}
          {entries.map((entry, i) => {
            totalDr += entry.debit ?? 0;
            totalCr += entry.credit ?? 0;
            running = entry.balance ?? running + (entry.debit ?? 0) - (entry.credit ?? 0);
            return (
              <Fragment key={i}>
                <tr>
                  <td data-mono="true">{entry.date}</td>
                  <td>{entry.memo}</td>
                  <td data-mono="true">{entry.ref}</td>
                  {amountCell(entry.debit)}
                  {amountCell(entry.credit)}
                  {balanceCell(running)}
                </tr>
                {entry.splits?.map((split, si) => (
                  <tr key={si} className="cp-ledger__row--split">
                    <td />
                    <td>{split.memo}</td>
                    <td />
                    {amountCell(split.debit)}
                    {amountCell(split.credit)}
                    <td />
                  </tr>
                ))}
              </Fragment>
            );
          })}
          {totals && (
            <tr className="cp-foot cp-foot--total">
              <td />
              <td>Totals</td>
              <td />
              {amountCell(totalDr)}
              {amountCell(totalCr)}
              {balanceCell(running)}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
