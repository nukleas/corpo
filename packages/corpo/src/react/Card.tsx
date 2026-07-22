import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  flat?: boolean;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Card({ title, description, footer, headerActions, flat = false, className = '', children, ...rest }: CardProps) {
  return (
    <div className={cx('cp-card', flat && 'cp-card--flat', className)} {...rest}>
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
