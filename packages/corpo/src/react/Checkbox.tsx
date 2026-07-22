import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  description?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Checkbox({ label, description, className = '', disabled, ...rest }: CheckboxProps) {
  return (
    <label className={cx('cp-checkbox', !!description && 'cp-checkbox--has-description', disabled && 'cp-checkbox--disabled', className)}>
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
