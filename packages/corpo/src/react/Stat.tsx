import type { HTMLAttributes, ReactNode } from 'react';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: 'up' | 'down' | 'neutral';
  hint?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Stat({ label, value, delta, deltaTone = 'neutral', hint, className = '', ...rest }: StatProps) {
  return (
    <div className={cx('cp-stat', className)} {...rest}>
      <span className="cp-stat__label">{label}</span>
      <span className="cp-stat__row">
        <span className="cp-stat__value">{value}</span>
        {delta && <span className={cx('cp-stat__delta', deltaTone !== 'neutral' && `cp-stat__delta--${deltaTone}`)}>{delta}</span>}
      </span>
      {hint && <span className="cp-stat__hint">{hint}</span>}
    </div>
  );
}
