import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {}

export function ButtonGroup({ className = '', children, ...rest }: ButtonGroupProps) {
  return (
    <div className={cx('cp-button-group', className)} role="group" {...rest}>
      {children}
    </div>
  );
}
