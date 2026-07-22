import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Mono uppercase title in the header row. */
  title?: ReactNode;
  /** Muted description line under the title. */
  description?: ReactNode;
  /** Right-aligned actions in the header row. */
  headerActions?: ReactNode;
  /** Hairline-separated footer row. */
  footer?: ReactNode;
  /** Drop the shadow. @default false */
  flat?: boolean;
  children?: ReactNode;
}

/** Corpo card — white panel, 1px border, 4px radius, quiet elevation. */
export function Card({ title, description, footer, headerActions, flat = false, className, children, ...rest }: CardProps) {
  return (
    <div className={cn('cp-card', flat && 'cp-card--flat', className)} {...rest}>
      {(title || description) && (
        <div className="cp-card__header">
          <div className="cp-card__heading">
            {title && <h3 className="cp-card__title">{title}</h3>}
            {description && <p className="cp-card__description">{description}</p>}
          </div>
          {headerActions}
        </div>
      )}
      <div className="cp-card__body">{children}</div>
      {footer && <div className="cp-card__footer">{footer}</div>}
    </div>
  );
}
