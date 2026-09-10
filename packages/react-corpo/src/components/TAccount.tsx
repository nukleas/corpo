import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount, amountValue, roundCents } from './Amount';
import type { AmountShorthand } from './Amount';

export interface TAccountEntry {
  label: ReactNode;
  amount: AmountShorthand;
  /** Carry-down styling for `Balance c/d` / `Balance b/d` lines. */
  carry?: boolean;
}

export interface TAccountProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Account title on the crossbar. */
  title: ReactNode;
  /** Left side — debits. */
  debits: TAccountEntry[];
  /** Right side — credits. */
  credits: TAccountEntry[];
}

/**
 * T-account — Dr always left, Cr always right, title on the crossbar. Both
 * sides are footed automatically (numeric shorthands only); when the footings
 * agree the total takes the proved double rule. There is no accounting engine:
 * model closing by passing the balancing `Balance c/d` entry yourself, with
 * `carry` set.
 */
export function TAccount({ title, debits, credits, className, ...rest }: TAccountProps) {
  const foot = (entries: TAccountEntry[]) =>
    roundCents(entries.reduce((sum, e) => sum + (amountValue(e.amount) ?? 0), 0));
  const drFoot = foot(debits);
  const crFoot = foot(credits);
  const proved = drFoot === crFoot;

  const side = (entries: TAccountEntry[], footing: number, headLabel: string, cr: boolean) => (
    <div className={cn('cp-taccount__side', cr && 'cp-taccount__side--cr')}>
      <div className="cp-taccount__head">{headLabel}</div>
      {entries.map((entry, i) => (
        // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
        <div key={i} className={cn('cp-taccount__entry', entry.carry && 'cp-taccount__entry--carry')}>
          <span className="cp-taccount__entry-label">{entry.label}</span>
          {Amount.create(entry.amount)}
        </div>
      ))}
      <div className={cn('cp-taccount__entry', 'cp-taccount__foot', proved && 'cp-taccount__foot--proved')}>
        <span className="cp-taccount__entry-label" />
        {Amount.create(footing)}
      </div>
    </div>
  );

  return (
    <div className={cn('cp-taccount', className)} {...rest}>
      <div className="cp-taccount__title">{title}</div>
      <div className="cp-taccount__panes">
        {side(debits, drFoot, 'Dr', false)}
        {side(credits, crFoot, 'Cr', true)}
      </div>
    </div>
  );
}
