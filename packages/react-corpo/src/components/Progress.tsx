import { useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. @default 0 */
  value?: number;
  /** @default 100 */
  max?: number;
  /** Bar color. @default 'accent' */
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** 8px track instead of 4px. @default false */
  thick?: boolean;
  /** Mono label with a % readout above the bar; also names the progressbar. Without one, pass `aria-label`. */
  label?: ReactNode;
}

/** Corpo progress bar — thin 4px track (8px thick), no glow tip. */
export function Progress({
  value = 0,
  max = 100,
  tone = 'accent',
  thick = false,
  label,
  className,
  'aria-label': ariaLabel,
  ...rest
}: ProgressProps) {
  const labelId = useId();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('cp-progress', className)} {...rest}>
      {label && (
        <div className="cp-progress__header">
          <span id={labelId} className="cp-progress__label">
            {label}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('cp-progress__track', thick && 'cp-progress__track--thick')}
      >
        <div
          className={cn('cp-progress__fill', tone !== 'accent' && `cp-progress__fill--${tone}`)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
