import type { HTMLAttributes, ReactNode } from 'react';

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Empty({ icon, title, description, action, className = '', ...rest }: EmptyProps) {
  return (
    <div className={cx('cp-empty', className)} {...rest}>
      {icon && <span className="cp-empty__icon">{icon}</span>}
      <span className="cp-empty__title">{title}</span>
      {description && <span className="cp-empty__description">{description}</span>}
      {action && <div className="cp-empty__action">{action}</div>}
    </div>
  );
}
