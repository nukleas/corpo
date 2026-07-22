import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  size?: 'sm' | 'md';
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Switch({ label, size = 'md', className = '', disabled, ...rest }: SwitchProps) {
  return (
    <label className={cx('cp-switch', size === 'sm' && 'cp-switch--sm', disabled && 'cp-switch--disabled', className)}>
      <input type="checkbox" role="switch" className="cp-switch__input" disabled={disabled} {...rest} />
      <span className="cp-switch__track" aria-hidden="true">
        <span className="cp-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
