import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Progress } from './Progress';

export interface ProfileCapacityRow {
  label: string;
  /** Current value; rendered as a percentage of `max`. */
  value: number;
  /** Value that fills the bar. Defaults to 100. */
  max?: number;
  /** Bar color. Defaults to the accent. */
  tone?: 'accent' | 'success' | 'warning' | 'danger';
}

export interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Tighter spacing. */
  compact?: boolean;
  /** Three-column layout — capacity sits beside the identity. */
  wide?: boolean;
  children?: ReactNode;
}

/**
 * Person/directory profile card frame. Compose with
 * {@link ProfileCardPortrait}, {@link ProfileCardIdentity},
 * {@link ProfileCardCapacity}, {@link ProfileCardSkills},
 * and {@link ProfileCardBio}.
 */
export function ProfileCard({
  compact = false,
  wide = false,
  className = '',
  children,
  ...rest
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'cp-profile',
        compact && 'cp-profile--compact',
        wide && 'cp-profile--wide',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface ProfileCardPortraitProps extends HTMLAttributes<HTMLDivElement> {
  /** Portrait content — typically an {@link Avatar} plus a {@link StatusPill}. */
  children?: ReactNode;
}

/** Quiet inset portrait column. */
export function ProfileCardPortrait({
  className = '',
  children,
  ...rest
}: ProfileCardPortraitProps) {
  return (
    <div className={cn('cp-profile__portrait', className)} {...rest}>
      {children}
    </div>
  );
}

export interface ProfileCardIdentityProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  name: ReactNode;
  /** Role line, e.g. "Staff engineer". */
  role?: ReactNode;
  /** Team micro-label, e.g. "Payments platform". */
  team?: ReactNode;
}

/** Name, role, and team. */
export function ProfileCardIdentity({
  name,
  role,
  team,
  className = '',
  children,
  ...rest
}: ProfileCardIdentityProps) {
  return (
    <div className={cn('cp-profile__identity', className)} {...rest}>
      <div className="cp-profile__name">{name}</div>
      {role != null && <div className="cp-profile__role">{role}</div>}
      {team != null && <div className="cp-profile__team">{team}</div>}
      {children}
    </div>
  );
}

export interface ProfileCardCapacityProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  rows: ProfileCapacityRow[];
  /** Section heading. Defaults to "Capacity". */
  title?: ReactNode;
}

/** Capacity/utilization block — labeled {@link Progress} rows. */
export function ProfileCardCapacity({
  rows,
  title = 'Capacity',
  className = '',
  ...rest
}: ProfileCardCapacityProps) {
  return (
    <div className={cn('cp-profile__capacity', className)} {...rest}>
      {title != null && <div className="cp-profile__section-title">{title}</div>}
      {rows.map((row) => (
        <Progress
          key={row.label}
          label={row.label}
          value={row.value}
          max={row.max ?? 100}
          tone={row.tone}
        />
      ))}
    </div>
  );
}

export interface ProfileCardSkillsProps extends HTMLAttributes<HTMLDivElement> {
  /** Skill tags — typically {@link Chip} children. */
  children?: ReactNode;
}

/** Skill-tag row — host for {@link Chip} / {@link Badge} children. */
export function ProfileCardSkills({
  className = '',
  children,
  ...rest
}: ProfileCardSkillsProps) {
  return (
    <div className={cn('cp-profile__skills', className)} {...rest}>
      {children}
    </div>
  );
}

export interface ProfileCardBioProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Short free-text biography block. */
export function ProfileCardBio({
  className = '',
  children,
  ...rest
}: ProfileCardBioProps) {
  return (
    <div className={cn('cp-profile__bio', className)} {...rest}>
      {children}
    </div>
  );
}

ProfileCard.Portrait = ProfileCardPortrait;
ProfileCard.Identity = ProfileCardIdentity;
ProfileCard.Capacity = ProfileCardCapacity;
ProfileCard.Skills = ProfileCardSkills;
ProfileCard.Bio = ProfileCardBio;
