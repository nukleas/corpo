import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- title is a ReactNode slot; a plain-string title doubles as the accessible name
  const ariaLabel = typeof title === 'string' ? title : undefined;

  return createPortal(
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- backdrop click is a pointer convenience; keyboard users close with Escape
    <div className="cp-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="cp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
       
      >
        {title && (
          <div className="cp-modal__header">
            <h2 className="cp-modal__title">{title}</h2>
            <button type="button" aria-label="Close" className="cp-modal__close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="cp-modal__body">{children}</div>
        {footer && <div className="cp-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
