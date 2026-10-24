import { useId, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { PolymorphicProps } from '../lib/polymorphic';

export interface ButtonOwnProps {
  /** Visual emphasis — use `primary` at most once per view. @default 'default' */
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  /** Control height: 28 / 36 / 44px. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Square icon-only button. @default false */
  icon?: boolean;
  /**
   * Spinner, aria-busy, and no activation. The label stays in the layout so the width does not jump.
   * @default false
   */
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, ButtonOwnProps>;

/**
 * Corpo action button — Public Sans, sentence case, neutral hover.
 * `loading` shows a spinner, sets `aria-busy`, and keeps the label width.
 * Renders a `<button>` by default; pass `as="a"` (with `href`) or a router
 * `Link` for navigation styled as a button.
 */
export function Button<C extends ElementType = 'button'>({
  as,
  variant = 'default',
  size = 'md',
  icon = false,
  loading = false,
  className,
  children,
  ...rest
}: ButtonProps<C>) {
  const Component: ElementType = as ?? 'button';
  const native = Component === 'button';
  // SAFETY: polymorphic rest is the rendered element's attributes. These five are
  // optional on that bag (anchors have no `disabled`); the component only reads them.
  const props = rest as {
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
    tabIndex?: number;
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const inactive = Boolean(props.disabled) || loading;
  const labelId = useId();
  const labelledBy =
    loading && props['aria-label'] == null ? (props['aria-labelledby'] ?? labelId) : props['aria-labelledby'];
  return (
    <Component
      {...rest}
      className={cn(
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
      tabIndex={!native && inactive ? -1 : props.tabIndex}
      onClick={
        !native && inactive
          ? (event: MouseEvent) => {
              event.preventDefault();
            }
          : props.onClick
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
