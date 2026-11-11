import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export interface RecordPagerProps extends HTMLAttributes<HTMLDivElement> {
  /** 1-based position of the open record in the list it was opened from. */
  position: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Names the group. @default 'Record navigation' */
  label?: string;
}

/**
 * Corpo record pager — "3 of 120" with previous and next buttons, for stepping
 * through the list a record was opened from. Pass it to {@link RecordPage}'s `pager`.
 */
export function RecordPager({
  position,
  total,
  onPrevious,
  onNext,
  label = 'Record navigation',
  className,
  ...rest
}: RecordPagerProps) {
  return (
    <div className={cn('cp-record-pager', className)} role="group" aria-label={label} {...rest}>
      <span className="cp-record-pager__position" aria-live="polite">
        {position.toLocaleString()} of {total.toLocaleString()}
      </span>
      <Button size="sm" icon aria-label="Previous record" disabled={position <= 1} onClick={onPrevious}>
        ‹
      </Button>
      <Button size="sm" icon aria-label="Next record" disabled={position >= total} onClick={onNext}>
        ›
      </Button>
    </div>
  );
}
