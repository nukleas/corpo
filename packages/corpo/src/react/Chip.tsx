import type { HTMLAttributes, ReactNode } from 'react';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Chip({ onRemove, className = '', children, ...rest }: ChipProps) {
  return (
    <span className={cx('cp-chip', className)} {...rest}>
      {children}
      {onRemove && (
        <button type="button" className="cp-chip__remove" aria-label="Remove" onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  );
}
