import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  children?: ReactNode;
}

export function Select({ size = 'md', error = false, className = '', children, ...rest }: SelectProps) {
  return (
    <span className={cx('cp-select', size !== 'md' && `cp-select--${size}`, error && 'cp-select--error', className)}>
      <select className="cp-select__control" {...rest}>
        {children}
      </select>
      <span className="cp-select__chevron" aria-hidden="true" />
    </span>
  );
}
