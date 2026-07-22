import type { HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'busy' | 'offline';
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Avatar({ src, alt = '', initials, size = 'md', status, className = '', ...rest }: AvatarProps) {
  return (
    <span className={cx('cp-avatar', size !== 'md' && `cp-avatar--${size}`, className)} {...rest}>
      {src ? <img className="cp-avatar__image" src={src} alt={alt} /> : initials}
      {status && <span className={cx('cp-avatar__status', `cp-avatar__status--${status}`)} aria-hidden="true" />}
    </span>
  );
}
