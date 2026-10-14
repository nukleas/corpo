import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount, roundCents } from './Amount';

export interface TrialBalanceRow {
  account: ReactNode;
  /** Folio / reference column. */
  ref?: ReactNode;
  /** Amount in the debit column — a row carries one side only. */
  debit?: number;
  /** Amount in the credit column — a row carries one side only. */
  credit?: number;
  /**
   * Sub-accounts — makes this row a collapsible group (an account tree). A
   * group's own debit/credit are ignored: it shows its children's net as a
   * subtotal, and only leaf accounts count toward the totals.
   */
  children?: TrialBalanceRow[];
}

/** A row as rendered: an account, a group header, or a group's subtotal line. */
interface Line {
  key: string;
  kind: 'account' | 'group' | 'subtotal';
  row: TrialBalanceRow;
  level: number;
  debit?: number;
  credit?: number;
  open?: boolean;
}

const leaves = (rows: TrialBalanceRow[]): TrialBalanceRow[] =>
  rows.flatMap((r) => (r.children?.length ? leaves(r.children) : [r]));

/** A group's balance as one figure on its normal side. */
const net = (rows: TrialBalanceRow[]) => {
  const all = leaves(rows);
  const n = roundCents(all.reduce((sum, r) => sum + (r.debit ?? 0) - (r.credit ?? 0), 0));
  return n >= 0 ? { debit: n } : { credit: -n };
};

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
 * Σ Dr ≠ Σ Cr the imbalance renders as a first-class error strip and the
 * totals keep the single rule — only a proved balance earns the double rule.
 * `$` marks the first figure in each column and the totals (statement
 * convention). Rows with `children` form an account tree: groups collapse to
 * their net subtotal, and only leaf accounts are totaled.
 */
export function TrialBalance({ entity, asOf, rows, className, ...rest }: TrialBalanceProps) {
  const base = useId();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const accounts = leaves(rows);
  const totalDr = roundCents(accounts.reduce((sum, r) => sum + (r.debit ?? 0), 0));
  const totalCr = roundCents(accounts.reduce((sum, r) => sum + (r.credit ?? 0), 0));
  const diff = roundCents(totalDr - totalCr);
  const balanced = diff === 0;
  const isTree = rows.some((r) => (r.children?.length ?? 0) > 0);

  const lines: Line[] = [];
  const walk = (list: TrialBalanceRow[], level: number, path: string) =>
    list.forEach((row, i) => {
      const key = `${path}${i}`;
      if (!row.children?.length) {
        lines.push({ key, kind: 'account', row, level, debit: row.debit, credit: row.credit });
        return;
      }
      const open = !collapsed.has(key);
      const group: Line = { key, kind: 'group', row, level, open };
      // Collapsed, the group's own row carries its net balance.
      if (!open) Object.assign(group, net(row.children));
      lines.push(group);
      if (open) {
        walk(row.children, level + 1, `${key}.`);
        lines.push({ key: `${key}-total`, kind: 'subtotal', row, level, ...net(row.children) });
      }
    });
  walk(rows, 1, '');
  const firstDr = lines.findIndex((l) => l.debit != null);
  const firstCr = lines.findIndex((l) => l.credit != null);

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
            {lines.map((line, i) => {
              const accountId = `${base}-${line.key}`;
              return (
                <tr
                  key={line.key}
                  className={cn(
                    line.kind === 'group' && 'cp-trial__group',
                    line.kind === 'subtotal' && 'cp-foot cp-foot--subtotal',
                  )}
                >
                  <td
                    className={cn(isTree && 'cp-table__tree-cell')}
                    {...(isTree && { 'data-level': Math.min(line.level, 6) })}
                  >
                    {line.kind === 'subtotal' ? (
                      <>Total {line.row.account}</>
                    ) : (
                      <span id={accountId}>{line.row.account}</span>
                    )}
                    {line.kind === 'group' && (
                      <button
                        type="button"
                        className="cp-table__tree-toggle"
                        aria-expanded={line.open}
                        aria-labelledby={accountId}
                        onClick={() => toggle(line.key)}
                      >
                        <span aria-hidden="true">›</span>
                      </button>
                    )}
                  </td>
                  <td data-mono="true">{line.kind === 'subtotal' ? null : line.row.ref}</td>
                  <td data-numeric="true">
                    {line.debit != null && <Amount value={line.debit} currency={i === firstDr ? '$' : undefined} />}
                  </td>
                  <td data-numeric="true">
                    {line.credit != null && <Amount value={line.credit} currency={i === firstCr ? '$' : undefined} />}
                  </td>
                </tr>
              );
            })}
            <tr className={cn('cp-foot', balanced ? 'cp-foot--grand' : 'cp-foot--total')}>
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
