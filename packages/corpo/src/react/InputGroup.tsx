import type { HTMLAttributes, ReactNode } from 'react';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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
