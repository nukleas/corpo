import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  size?: 'sm' | 'md';
}

export function Switch({ label, size = 'md', className = '', disabled, ...rest }: SwitchProps) {
  return (
    <label className={cx('cp-switch', size === 'sm' && 'cp-switch--sm', disabled && 'cp-switch--disabled', className)}>
      {/* oxlint-disable-next-line jsx-a11y/role-has-required-aria-props -- a native checkbox exposes its checked state as aria-checked */}
      <input type="checkbox" role="switch" className="cp-switch__input" disabled={disabled} {...rest} />
      <span className="cp-switch__track" aria-hidden="true">
        <span className="cp-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
