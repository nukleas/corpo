import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Amount, roundCents } from './Amount';

export interface TAccountEntry {
  label: ReactNode;
  amount: number;
  /** Carry-down styling for `Balance c/d` / `Balance b/d` lines. */
  carry?: boolean;
}

export interface TAccountProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Account title on the crossbar. */
  title: ReactNode;
  debits: TAccountEntry[];
  credits: TAccountEntry[];
}

/** T-account — Dr left, Cr right, auto footings, proved double rule when the sides agree. */
export function TAccount({ title, debits, credits, className = '', ...rest }: TAccountProps) {
  const drFoot = roundCents(debits.reduce((sum, e) => sum + e.amount, 0));
  const crFoot = roundCents(credits.reduce((sum, e) => sum + e.amount, 0));
  const proved = drFoot === crFoot;

  const side = (entries: TAccountEntry[], footing: number, headLabel: string, cr: boolean) => (
    <div className={cx('cp-taccount__side', cr && 'cp-taccount__side--cr')}>
      <div className="cp-taccount__head">{headLabel}</div>
      {entries.map((entry, i) => (
        <div key={i} className={cx('cp-taccount__entry', entry.carry && 'cp-taccount__entry--carry')}>
          <span className="cp-taccount__entry-label">{entry.label}</span>
          <Amount value={entry.amount} />
        </div>
      ))}
      <div className={cx('cp-taccount__entry', 'cp-taccount__foot', proved && 'cp-taccount__foot--proved')}>
        <span className="cp-taccount__entry-label" />
        <Amount value={footing} />
      </div>
    </div>
  );

  return (
    <div className={cx('cp-taccount', className)} {...rest}>
      <div className="cp-taccount__title">{title}</div>
      <div className="cp-taccount__panes">
        {side(debits, drFoot, 'Dr', false)}
        {side(credits, crFoot, 'Cr', true)}
      </div>
    </div>
  );
}
