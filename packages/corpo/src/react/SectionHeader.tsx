import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned action row. */
  actions?: ReactNode;
  /** Heading level of the title — match the surrounding outline. @default 2 */
  level?: 2 | 3 | 4;
  /** `id` of the title heading, for `aria-labelledby`. */
  titleId?: string;
}

/** Corpo section header — title/description row with actions, sits atop a table or panel. */
export function SectionHeader({
  title,
  description,
  actions,
  level = 2,
  titleId,
  className,
  ...rest
}: SectionHeaderProps) {
  const Heading = `h${level}` as const;
  return (
    <div className={cx('cp-section-header', className)} {...rest}>
      <div className="cp-section-header__heading">
        <Heading id={titleId} className="cp-section-header__title">
          {title}
        </Heading>
        {description && <p className="cp-section-header__description">{description}</p>}
      </div>
      {actions && <div className="cp-section-header__actions">{actions}</div>}
    </div>
  );
}
