import type { HTMLAttributes } from 'react';
import { Kbd } from './Kbd';

export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  keys: string[];
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function KbdGroup({ keys, className = '', ...rest }: KbdGroupProps) {
  return (
    <span className={cx('cp-kbd-group', className)} {...rest}>
      {keys.map((k, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {i > 0 && <span className="cp-kbd-group__sep">+</span>}
          <Kbd>{k}</Kbd>
        </span>
      ))}
    </span>
  );
}
