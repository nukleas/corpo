import type { HTMLAttributes } from 'react';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
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
