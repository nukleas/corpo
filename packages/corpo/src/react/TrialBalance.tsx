import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Amount, roundCents } from './Amount';

export interface TrialBalanceRow {
  account: ReactNode;
  ref?: ReactNode;
  /** Amount in the debit column — a row carries one side only. */
  debit?: number;
  /** Amount in the credit column — a row carries one side only. */
  credit?: number;
}

export interface TrialBalanceProps extends HTMLAttributes<HTMLDivElement> {
  entity?: ReactNode;
  /** "As of" line under the title. */
  asOf?: ReactNode;
  rows: TrialBalanceRow[];
}

/** Trial balance — Account · Ref · Dr · Cr, proved double-rule totals, error strip when unbalanced. */
export function TrialBalance({ entity, asOf, rows, className = '', ...rest }: TrialBalanceProps) {
  const totalDr = roundCents(rows.reduce((sum, r) => sum + (r.debit ?? 0), 0));
  const totalCr = roundCents(rows.reduce((sum, r) => sum + (r.credit ?? 0), 0));
  const diff = roundCents(totalDr - totalCr);
  const firstDr = rows.findIndex((r) => r.debit != null);
  const firstCr = rows.findIndex((r) => r.credit != null);

  return (
    <div className={cx('cp-trial', className)} {...rest}>
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
              <tr key={i}>
                <td>{row.account}</td>
                <td data-mono="true">{row.ref}</td>
                <td data-numeric="true">
                  {row.debit != null && <Amount value={row.debit} currency={i === firstDr ? '$' : undefined} />}
                </td>
                <td data-numeric="true">
                  {row.credit != null && <Amount value={row.credit} currency={i === firstCr ? '$' : undefined} />}
                </td>
              </tr>
            ))}
            <tr className={cx('cp-foot', diff === 0 ? 'cp-foot--grand' : 'cp-foot--total')}>
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
      {diff !== 0 && (
        <div className="cp-trial__proof cp-trial__proof--error" role="alert">
          Out of balance by <Amount value={Math.abs(diff)} /> — {diff > 0 ? 'Dr' : 'Cr'} over
        </div>
      )}
    </div>
  );
}
