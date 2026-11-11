import type { ReactNode } from 'react';
import { cx } from './cx';
import type { MenuItem } from './MenuList';
import { Button } from './Button';
import { Dropdown } from './Dropdown';

export interface SplitButtonProps {
  /** The main action. Verb-first copy. */
  children: ReactNode;
  onClick?: () => void;
  /** Related actions behind the arrow — "Save and new", "Save as draft". */
  items: MenuItem[];
  /** Names the arrow button. @default 'More options' */
  menuLabel?: string;
  /** @default 'default' */
  variant?: 'default' | 'primary';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Busy main action; the arrow stays usable. */
  loading?: boolean;
  className?: string;
}

/**
 * Corpo split button — a main action joined to an arrow that opens a menu of
 * related actions. The menu has the {@link Dropdown} keyboard model.
 */
export function SplitButton({
  children,
  onClick,
  items,
  menuLabel = 'More options',
  variant = 'default',
  size = 'md',
  disabled,
  loading,
  className,
}: SplitButtonProps) {
  return (
    <div className={cx('cp-button-group', 'cp-split-button', className)} role="group">
      <Button variant={variant} size={size} disabled={disabled} loading={loading} onClick={onClick}>
        {children}
      </Button>
      <Dropdown
        align="right"
        items={items}
        trigger={
          <Button variant={variant} size={size} icon disabled={disabled} aria-label={menuLabel}>
            <span className="cp-split-button__caret" aria-hidden="true" />
          </Button>
        }
      />
    </div>
  );
}
