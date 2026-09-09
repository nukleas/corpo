import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount } from './Amount';

export interface TrialBalanceRow {
  account: ReactNode;
  /** Folio / reference column. */
  ref?: ReactNode;
  /** Amount in the debit column — a row carries one side only. */
  debit?: number;
  /** Amount in the credit column — a row carries one side only. */
  credit?: number;
}

export interface TrialBalanceProps extends HTMLAttributes<HTMLDivElement> {
  /** Entity name in the document header. */
  entity?: ReactNode;
  /** "As of" line under the title. */
  asOf?: ReactNode;
  rows: TrialBalanceRow[];
}

/**
 * Trial balance — Account · Ref · Dr · Cr with the classic centered document
 * header and proved double-rule totals (`$` on both). Amounts are plain
 * numbers (a trial balance is a computed document, not an input). When
 * Σ Dr ≠ Σ Cr the imbalance renders as a first-class error strip, not just a
 * red number.
 */
export function TrialBalance({ entity, asOf, rows, className, ...rest }: TrialBalanceProps) {
  const totalDr = rows.reduce((sum, r) => sum + (r.debit ?? 0), 0);
  const totalCr = rows.reduce((sum, r) => sum + (r.credit ?? 0), 0);
  const diff = Math.round((totalDr - totalCr) * 100) / 100;
  const balanced = diff === 0;

  return (
    <div className={cn('cp-trial', className)} {...rest}>
      {(entity || asOf) && (
        <div className="cp-trial__header">
          {entity && <div className="cp-trial__entity">{entity}</div>}
          <div className="cp-trial__title">Trial Balance</div>
          {asOf && <div className="cp-trial__asof">{asOf}</div>}
        </div>
      )}
      <div className="cp-table cp-table--compact cp-ledger">
        <table className="cp-table__table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Ref</th>
              <th data-numeric="true">Dr</th>
              <th data-numeric="true">Cr</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
              <tr key={i}>
                <td>{row.account}</td>
                <td data-mono="true">{row.ref}</td>
                <td data-numeric="true">{row.debit != null && <Amount value={row.debit} />}</td>
                <td data-numeric="true">{row.credit != null && <Amount value={row.credit} />}</td>
              </tr>
            ))}
            <tr className="cp-foot cp-foot--grand">
              <td>Totals</td>
              <td />
              <td data-numeric="true">
                <Amount value={totalDr} currency="$" />
              </td>
              <td data-numeric="true">
                <Amount value={totalCr} currency="$" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {!balanced && (
        <div className="cp-trial__proof cp-trial__proof--error" role="alert">
          Out of balance by <Amount value={Math.abs(diff)} /> — {diff > 0 ? 'Dr' : 'Cr'} over
        </div>
      )}
    </div>
  );
}
