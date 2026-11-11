import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface BrandProps extends HTMLAttributes<HTMLDivElement> {
  /** Product or company name. */
  name: string;
  /** Second line — the legal entity, environment, or plan. */
  detail?: ReactNode;
  /** An `<img>` or `<svg>`. Without one, the mark shows the name's initials on the accent. */
  logo?: ReactNode;
}

/** Initials for the mark: the first letters of the first two words. */
export function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** The parts of a brand row, shared with {@link EntitySwitcher}'s trigger. */
export function BrandContent({ name, detail, logo }: Pick<BrandProps, 'name' | 'detail' | 'logo'>) {
  return (
    <>
      <span className="cp-brand__mark" aria-hidden="true">
        {logo ?? brandInitials(name)}
      </span>
      <span className="cp-brand__text">
        <span className="cp-brand__name">{name}</span>
        {detail != null && <span className="cp-brand__detail">{detail}</span>}
      </span>
    </>
  );
}

/**
 * Corpo brand — a mark, the name and an optional detail line, for
 * {@link SideNav}'s `brand` slot. In the collapsed rail only the mark shows.
 * Use {@link EntitySwitcher} instead when users switch between companies.
 */
export function Brand({ name, detail, logo, className, ...rest }: BrandProps) {
  return (
    <div className={cn('cp-brand', className)} {...rest}>
      <BrandContent name={name} detail={detail} logo={logo} />
    </div>
  );
}
