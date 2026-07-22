import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface PopoverProps {
  trigger: ReactNode;
  children?: ReactNode;
  align?: 'left' | 'right';
  side?: 'bottom' | 'top';
  /** Controlled open state — omit to let Popover manage its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Popover({ trigger, children, align = 'left', side = 'bottom', open, onOpenChange, className = '' }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div ref={ref} className={cx('cp-popover', className)}>
      <span onClick={() => setOpen(!isOpen)}>{trigger}</span>
      {isOpen && (
        <div
          className={cx(
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
