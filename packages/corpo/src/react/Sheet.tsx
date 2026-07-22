import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left' | 'bottom';
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Sheet({ open, onClose, side = 'right', title, footer, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="cp-sheet-backdrop" onClick={onClose}>
      <div className={cx('cp-sheet', `cp-sheet--${side}`)} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="cp-sheet__header">
            <h2 className="cp-sheet__title">{title}</h2>
            <button type="button" aria-label="Close" className="cp-sheet__close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="cp-sheet__body">{children}</div>
        {footer && <div className="cp-sheet__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
