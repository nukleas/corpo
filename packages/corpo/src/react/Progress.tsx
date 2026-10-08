import { useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  thick?: boolean;
  label?: ReactNode;
}

export function Progress({ value = 0, max = 100, tone = 'accent', thick = false, label, className = '', 'aria-label': ariaLabel, ...rest }: ProgressProps) {
  const labelId = useId();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cx('cp-progress', className)} {...rest}>
      {label && (
        <div className="cp-progress__header">
          <span id={labelId} className="cp-progress__label">{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} className={cx('cp-progress__track', thick && 'cp-progress__track--thick')}>
        <div className={cx('cp-progress__fill', tone !== 'accent' && `cp-progress__fill--${tone}`)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
