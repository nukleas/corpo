import { useId, type ButtonHTMLAttributes, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { cx } from './cx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  /** Spinner, aria-busy, and no activation. The label stays in the layout so the width does not jump. */
  loading?: boolean;
  /** Element or component to render as (e.g. `'a'` or a router `Link`). */
  as?: ElementType;
  /** Link target when rendering as an anchor. */
  href?: string;
  children?: ReactNode;
}

export function Button({
  as,
  variant = 'default',
  size = 'md',
  icon = false,
  loading = false,
  className = '',
  children,
  disabled,
  onClick,
  tabIndex,
  ...rest
}: ButtonProps) {
  const Component: ElementType = as ?? 'button';
  const native = Component === 'button';
  const inactive = Boolean(disabled) || loading;
  const labelId = useId();
  const labelledBy =
    loading && rest['aria-label'] == null ? (rest['aria-labelledby'] ?? labelId) : rest['aria-labelledby'];
  return (
    <Component
      {...rest}
      className={cx(
        'cp-btn',
        variant !== 'default' && `cp-btn--${variant}`,
        size !== 'md' && `cp-btn--${size}`,
        icon && 'cp-btn--icon',
        loading && 'cp-btn--loading',
        className,
      )}
      aria-busy={loading ? true : undefined}
      aria-labelledby={labelledBy}
      disabled={native ? inactive : undefined}
      aria-disabled={!native && inactive ? true : undefined}
      tabIndex={!native && inactive ? -1 : tabIndex}
      onClick={
        !native && inactive
          ? (event: MouseEvent) => {
              event.preventDefault();
            }
          : onClick
      }
    >
      <span className="cp-btn__label" id={labelId}>
        {children}
      </span>
      {loading ? (
        <span className="cp-btn__busy" aria-hidden="true">
          <span className="cp-spinner__ring" />
        </span>
      ) : null}
    </Component>
  );
}
