import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import type { LicenseItem } from './LicenseCatalog';

export interface LicenseDetailProps extends HTMLAttributes<HTMLDivElement> {
  /** License to describe; renders a muted placeholder when absent. */
  item?: LicenseItem | null;
  /** Action row content — typically Assign/Revoke buttons supplied by the host. */
  actions?: ReactNode;
}

/** Selected-license detail panel — tier-tinted header, cost/renewal rows, description. */
export function LicenseDetail({
  item,
  actions,
  className = '',
  ...rest
}: LicenseDetailProps) {
  if (!item) {
    return (
      <div className={cn('cp-license-detail', className)} {...rest}>
        <div className="cp-license-detail__header">
          <span className="cp-license-detail__category">No license selected</span>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn('cp-license-detail', `cp-tier--${item.tier}`, className)}
      {...rest}
    >
      <div className="cp-license-detail__header">
        <span className="cp-license-detail__tier">{item.tier}</span>
        <span className="cp-license-detail__name">{item.name}</span>
        {item.category != null && (
          <span className="cp-license-detail__category">{item.category}</span>
        )}
      </div>
      {item.details != null && item.details.length > 0 && (
        <div className="cp-license-detail__rows">
          {item.details.map((row) => (
            <div key={row.label} className="cp-license-detail__row">
              <span className="cp-license-detail__row-label">{row.label}</span>
              <span className="cp-license-detail__row-value">{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {item.desc != null && <div className="cp-license-detail__desc">{item.desc}</div>}
      {actions != null && <div className="cp-license-detail__actions">{actions}</div>}
    </div>
  );
}
