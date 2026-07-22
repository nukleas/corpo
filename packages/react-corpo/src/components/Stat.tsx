import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase mono label. */
  label: ReactNode;
  /** Main value, rendered mono with tabular nums. */
  value: ReactNode;
  /** Delta string, e.g. "+4.2%". */
  delta?: ReactNode;
  /** Delta color. @default 'neutral' */
  deltaTone?: 'up' | 'down' | 'neutral';
  /** Small dim footnote. */
  hint?: ReactNode;
}

/** Corpo KPI stat — mono label over a large tabular-nums value with an optional delta. */
export function Stat({ label, value, delta, deltaTone = 'neutral', hint, className, ...rest }: StatProps) {
  return (
    <div className={cn('cp-stat', className)} {...rest}>
      <span className="cp-stat__label">{label}</span>
      <span className="cp-stat__row">
        <span className="cp-stat__value">{value}</span>
        {delta && <span className={cn('cp-stat__delta', deltaTone !== 'neutral' && `cp-stat__delta--${deltaTone}`)}>{delta}</span>}
      </span>
      {hint && <span className="cp-stat__hint">{hint}</span>}
    </div>
  );
}
