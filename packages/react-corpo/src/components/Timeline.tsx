import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Status-palette tone for the rail dot — `ok` / `warn` / `err` / `idle`, matching `cp-status-dot`. */
export type TimelineTone = 'ok' | 'warn' | 'err' | 'idle';

export interface TimelineItem {
  title: ReactNode;
  timestamp: ReactNode;
  description?: ReactNode;
  /** Rail-dot tone. @default 'idle' */
  tone?: TimelineTone;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

/** Corpo timeline — vertical activity feed with a status-toned dot-and-line rail. */
export function Timeline({ items, className, ...rest }: TimelineProps) {
  return (
    <ol className={cn('cp-timeline', className)} {...rest}>
      {items.map((item, i) => {
        const tone = item.tone ?? 'idle';
        return (
          <li key={i} className={cn('cp-timeline__item', `cp-timeline__item--${tone}`)}>
            <span className="cp-timeline__rail" aria-hidden="true">
              <span className="cp-timeline__dot" />
            </span>
            <div className="cp-timeline__body">
              <div className="cp-timeline__header">
                <span className="cp-timeline__title">{item.title}</span>
                <span className="cp-timeline__time">{item.timestamp}</span>
              </div>
              {item.description && <div className="cp-timeline__desc">{item.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
