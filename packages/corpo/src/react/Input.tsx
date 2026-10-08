import type { InputHTMLAttributes } from 'react';
import { cx } from './cx';
import { useFieldControlProps } from './field-context';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  accent?: boolean;
  error?: boolean;
}

export function Input({ size = 'md', accent = false, error = false, className = '', ...rest }: InputProps) {
  const fieldProps = useFieldControlProps(error);
  return (
    <input
      {...fieldProps}
      className={cx(
        'cp-input',
        size !== 'md' && `cp-input--${size}`,
        accent && 'cp-input--accent',
        error && 'cp-input--error',
        className,
      )}
      {...rest}
    />
  );
}
