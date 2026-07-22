import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label text. */
  label?: ReactNode;
  /** Track size. @default 'md' */
  size?: 'sm' | 'md';
}

/** Corpo switch — pill track, accent when on. The one rounded control in the system. */
export function Switch({ label, size = 'md', className, disabled, ...rest }: SwitchProps) {
  return (
    <label className={cn('cp-switch', size === 'sm' && 'cp-switch--sm', disabled && 'cp-switch--disabled', className)}>
      <input type="checkbox" role="switch" className="cp-switch__input" disabled={disabled} {...rest} />
      <span className="cp-switch__track" aria-hidden="true">
        <span className="cp-switch__thumb" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
