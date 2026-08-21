import type { HTMLAttributes, ReactNode } from 'react';

export type StepperStatus = 'complete' | 'current' | 'upcoming';

export interface StepperItem {
  label: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  items: StepperItem[];
  /** 0-based index of the current step. Steps before it are complete; after it, upcoming. */
  current?: number;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function statusFor(index: number, current: number): StepperStatus {
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

export function Stepper({ items, current = 0, className = '', ...rest }: StepperProps) {
  return (
    <ol className={cx('cp-stepper', className)} {...rest}>
      {items.map((item, i) => {
        const status = statusFor(i, current);
        return (
          <li
            key={i}
            className={cx('cp-stepper__step', `cp-stepper__step--${status}`)}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className="cp-stepper__marker">{i + 1}</span>
            <span className="cp-stepper__label">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
