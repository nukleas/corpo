import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function Radio({ label, className = '', disabled, ...rest }: RadioProps) {
  return (
    <label className={cx('cp-radio', disabled && 'cp-radio--disabled', className)}>
      <input type="radio" className="cp-radio__input" disabled={disabled} {...rest} />
      <span className="cp-radio__box" aria-hidden="true" />
      {label && <span className="cp-radio__text">{label}</span>}
    </label>
  );
}
