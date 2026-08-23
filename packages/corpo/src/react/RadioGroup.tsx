import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({ orientation = 'vertical', className = '', children, ...rest }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cx('cp-radio-group', orientation === 'horizontal' && 'cp-radio-group--horizontal', className)} {...rest}>
      {children}
    </div>
  );
}
