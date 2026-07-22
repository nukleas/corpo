import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned action row. */
  actions?: ReactNode;
}

/** Corpo section header — title/description row with actions, sits atop a table or panel. */
export function SectionHeader({ title, description, actions, className, ...rest }: SectionHeaderProps) {
  return (
    <div className={cn('cp-section-header', className)} {...rest}>
      <div className="cp-section-header__heading">
        <h2 className="cp-section-header__title">{title}</h2>
        {description && <p className="cp-section-header__description">{description}</p>}
      </div>
      {actions && <div className="cp-section-header__actions">{actions}</div>}
    </div>
  );
}
