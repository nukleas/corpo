import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

const OPEN_DELAY = 500;
const CLOSE_DELAY = 200;

export interface HoverCardProps {
  /** The preview — a profile, a record summary. Supplementary only (see below). */
  content: ReactNode;
  /** The trigger, usually a link or a name. It should be focusable so keyboard users get the preview too. */
  children: ReactNode;
  /** @default 'left' */
  align?: 'left' | 'right';
  /** @default 'bottom' */
  side?: 'bottom' | 'top';
  className?: string;
}

/**
 * Corpo hover card — a {@link Popover}-styled preview that opens after the
 * pointer rests on the trigger (or at once on keyboard focus) and closes when
 * both pointer and focus leave, or on Escape. Screen readers do not announce
 * it and touch has no hover: put nothing there that isn't also reachable from
 * the trigger's destination.
 */
export function HoverCard({ content, children, align = 'left', side = 'bottom', className }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <span
      className={cn('cp-popover', className)}
      onMouseEnter={() => schedule(true, OPEN_DELAY)}
      onMouseLeave={() => schedule(false, CLOSE_DELAY)}
      onFocus={() => schedule(true, 0)}
      onBlur={(e) => {
        if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) schedule(false, 0);
      }}
    >
      {children}
      {open && (
        <div
          className={cn(
            'cp-popover__content',
            align === 'right' && 'cp-popover__content--right',
            side === 'top' && 'cp-popover__content--top',
          )}
        >
          {content}
        </div>
      )}
    </span>
  );
}
