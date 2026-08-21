import type { HTMLAttributes, ReactNode } from 'react';

export interface DescriptionListItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionListItem[];
  compact?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function DescriptionList({ items, compact = false, className = '', ...rest }: DescriptionListProps) {
  return (
    <dl className={cx('cp-desc-list', compact && 'cp-desc-list--compact', className)} {...rest}>
      {items.map((item, i) => (
        <div key={i} className="cp-desc-list__row">
          <dt className="cp-desc-list__label">{item.label}</dt>
          <dd className="cp-desc-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
