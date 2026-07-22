import type { InputHTMLAttributes, ReactNode } from 'react';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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
