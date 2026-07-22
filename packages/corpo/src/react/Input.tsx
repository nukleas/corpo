import type { InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  accent?: boolean;
  error?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Input({ size = 'md', accent = false, error = false, className = '', ...rest }: InputProps) {
  return (
    <input
      className={cx('cp-input', size !== 'md' && `cp-input--${size}`, accent && 'cp-input--accent', error && 'cp-input--error', className)}
      {...rest}
    />
  );
}
