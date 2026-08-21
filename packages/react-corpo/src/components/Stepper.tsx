import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StepperStatus = 'complete' | 'current' | 'upcoming';

export interface StepperItem {
  /** Step label, e.g. "Finance approval". */
  label: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  items: StepperItem[];
  /**
   * 0-based index of the current step. Steps before it render as complete;
   * steps after it as upcoming. Pass `items.length` to mark every step complete.
   * @default 0
   */
  current?: number;
}

function statusFor(index: number, current: number): StepperStatus {
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

/** Corpo stepper — numbered process steps; stacks vertically below 480px. */
export function Stepper({ items, current = 0, className, ...rest }: StepperProps) {
  return (
    <ol className={cn('cp-stepper', className)} {...rest}>
      {items.map((item, i) => {
        const status = statusFor(i, current);
        return (
          <li
            key={i}
            className={cn('cp-stepper__step', `cp-stepper__step--${status}`)}
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
