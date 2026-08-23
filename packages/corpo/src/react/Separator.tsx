import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function Separator({ orientation = 'horizontal', label, className = '', ...rest }: SeparatorProps) {
  if (label) {
    return (
      <div role="separator" className={cx('cp-separator--labeled', className)}>
        {label}
      </div>
    );
  }
  return <hr className={cx('cp-separator', `cp-separator--${orientation}`, className)} {...rest} />;
}
