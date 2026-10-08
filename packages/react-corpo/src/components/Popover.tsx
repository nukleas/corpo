import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PopoverProps {
  /** Element that opens the panel on click. */
  trigger: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'right';
  side?: 'bottom' | 'top';
  /** Controlled open state — omit to let Popover manage its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Corpo popover — freeform content panel, click-triggered, closes on outside click or Escape. */
export function Popover({
  trigger,
  children,
  align = 'left',
  side = 'bottom',
  open,
  onOpenChange,
  className,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, setOpen]);

  return (
    <div ref={ref} className={cn('cp-popover', className)}>
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the trigger (a Button) is the interactive element; its click, keyboard activation included, bubbles here */}
      <span onClick={() => setOpen(!isOpen)}>{trigger}</span>
      {isOpen && (
        <div
          className={cn(
            'cp-popover__content',
            align === 'right' && 'cp-popover__content--right',
            side === 'top' && 'cp-popover__content--top',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
