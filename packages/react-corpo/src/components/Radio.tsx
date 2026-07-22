import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text. */
  label?: ReactNode;
}

/** Corpo radio — 18px circle with an accent dot. Group via shared `name`. */
export function Radio({ label, className, disabled, ...rest }: RadioProps) {
  return (
    <label className={cn('cp-radio', disabled && 'cp-radio--disabled', className)}>
      <input type="radio" className="cp-radio__input" disabled={disabled} {...rest} />
      <span className="cp-radio__box" aria-hidden="true" />
      {label && <span className="cp-radio__text">{label}</span>}
    </label>
  );
}
