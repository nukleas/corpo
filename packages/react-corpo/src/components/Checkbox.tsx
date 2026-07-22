import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text. */
  label?: ReactNode;
  /** Secondary helper line under the label. */
  description?: ReactNode;
}

/** Corpo checkbox — 18px square, solid accent fill when checked. */
export function Checkbox({ label, description, className, disabled, ...rest }: CheckboxProps) {
  return (
    <label className={cn('cp-checkbox', !!description && 'cp-checkbox--has-description', disabled && 'cp-checkbox--disabled', className)}>
      <input type="checkbox" className="cp-checkbox__input" disabled={disabled} {...rest} />
      <span className="cp-checkbox__box" aria-hidden="true" />
      {label && (
        <span className="cp-checkbox__text">
          {label}
          {description && <span className="cp-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  );
}
