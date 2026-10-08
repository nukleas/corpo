import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './cx';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: 'right' | 'left' | 'bottom';
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
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
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- backdrop click is a pointer convenience; keyboard users close with Escape
    <div className="cp-sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx('cp-sheet', `cp-sheet--${side}`)} role="dialog" aria-modal="true">
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
