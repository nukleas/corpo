import type { HTMLAttributes } from 'react';
import { cx } from './cx';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export function Avatar({ src, alt = '', initials, size = 'md', status, className = '', ...rest }: AvatarProps) {
  return (
    <span className={cx('cp-avatar', size !== 'md' && `cp-avatar--${size}`, className)} {...rest}>
      {src ? <img className="cp-avatar__image" src={src} alt={alt} /> : initials}
      {status && <span className={cx('cp-avatar__status', `cp-avatar__status--${status}`)} aria-hidden="true" />}
    </span>
  );
}
