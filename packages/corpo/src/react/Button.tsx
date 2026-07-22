import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Button({
  variant = 'default',
  size = 'md',
  icon = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        'cp-btn',
        variant !== 'default' && `cp-btn--${variant}`,
        size !== 'md' && `cp-btn--${size}`,
        icon && 'cp-btn--icon',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
