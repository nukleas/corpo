import type { HTMLAttributes } from 'react';

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function RadioGroup({ orientation = 'vertical', className = '', children, ...rest }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cx('cp-radio-group', orientation === 'horizontal' && 'cp-radio-group--horizontal', className)} {...rest}>
      {children}
    </div>
  );
}
