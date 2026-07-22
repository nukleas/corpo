import type { HTMLAttributes } from 'react';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ButtonGroup({ className = '', children, ...rest }: ButtonGroupProps) {
  return (
    <div className={cx('cp-button-group', className)} role="group" {...rest}>
      {children}
    </div>
  );
}
