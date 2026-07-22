import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Kbd } from './Kbd';

export interface KbdGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** Key names joined with `+`. */
  keys: string[];
}

/** Corpo key combination group — joins multiple {@link Kbd} keys with a `+` separator. */
export function KbdGroup({ keys, className, ...rest }: KbdGroupProps) {
  return (
    <span className={cn('cp-kbd-group', className)} {...rest}>
      {keys.map((k, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {i > 0 && <span className="cp-kbd-group__sep">+</span>}
          <Kbd>{k}</Kbd>
        </span>
      ))}
    </span>
  );
}
