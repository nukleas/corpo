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

  return createPortal(
    <div className="cp-modal-backdrop" onClick={onClose}>
      <div
        className="cp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
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
