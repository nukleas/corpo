import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive. @default false */
  danger?: boolean;
  children?: ReactNode;
}

/** Corpo confirm dialog — `role="alertdialog"` variant of {@link Modal} for destructive/blocking actions. */
export function AlertDialog({ open, onClose, title, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, children }: AlertDialogProps) {
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
    <div className="cp-modal-backdrop">
      <div className="cp-modal" role="alertdialog" aria-modal="true" aria-label={ariaLabel}>
        {title && (
          <div className="cp-modal__header">
            <h2 className="cp-modal__title">{title}</h2>
          </div>
        )}
        <div className="cp-modal__body">{children}</div>
        <div className="cp-modal__footer">
          <button type="button" className="cp-btn cp-btn--sm" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn('cp-btn cp-btn--sm', danger ? 'cp-btn--danger' : 'cp-btn--primary')}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
