import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Image URL — falls back to `initials` when omitted or on load error. */
  src?: string;
  alt?: string;
  /** Fallback initials, e.g. "MI". */
  initials?: string;
  /** Diameter preset. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Presence dot. */
  status?: 'online' | 'away' | 'busy' | 'offline';
}

/** Corpo avatar — circular image or initials fallback, optional presence dot. */
export function Avatar({ src, alt = '', initials, size = 'md', status, className, ...rest }: AvatarProps) {
  return (
    <span className={cn('cp-avatar', size !== 'md' && `cp-avatar--${size}`, className)} {...rest}>
      {src ? <img className="cp-avatar__image" src={src} alt={alt} /> : initials}
      {status && <span className={cn('cp-avatar__status', `cp-avatar__status--${status}`)} aria-hidden="true" />}
    </span>
  );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {}

/** Overlapping stack of {@link Avatar}s. */
export function AvatarGroup({ className, children, ...rest }: AvatarGroupProps) {
  return (
    <span className={cn('cp-avatar-group', className)} {...rest}>
      {children}
    </span>
  );
}
