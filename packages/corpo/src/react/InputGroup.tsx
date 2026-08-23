import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

export function InputGroup({ leading, trailing, className = '', children, ...rest }: InputGroupProps) {
  return (
    <div className={cx('cp-input-group', className)} {...rest}>
      {leading && <span className="cp-input-group__addon cp-input-group__addon--leading">{leading}</span>}
      {children}
      {trailing && <span className="cp-input-group__addon cp-input-group__addon--trailing">{trailing}</span>}
    </div>
  );
}
