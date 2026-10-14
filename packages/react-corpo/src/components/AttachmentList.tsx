import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { formatFileSize } from '../lib/format';
import { Button } from './Button';

export interface Attachment {
  id: string;
  name: string;
  /** Size in bytes. */
  size: number;
  /** Download or preview URL; the name links to it. */
  href?: string;
  uploadedBy?: string;
  uploadedAt?: ReactNode;
}

export interface AttachmentListProps extends HTMLAttributes<HTMLDivElement> {
  attachments: Attachment[];
  /** Shows "Attach files"; called with the picked files. The page uploads and appends them. */
  onAdd?: (files: File[]) => void;
  /** Shows a remove button per file. */
  onRemove?: (id: string) => void;
  /** Native `accept` string for the picker, e.g. `.pdf,.png`. */
  accept?: string;
  /** @default 'No files attached.' */
  emptyText?: ReactNode;
}

const extension = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1, dot + 5) : 'file';
};

/**
 * Corpo attachment list — the files on a record: type, name (a download link),
 * size, who added it and when, with optional attach and remove. Compact enough
 * for {@link RecordPage}'s aside; for a large drop target and upload progress
 * use {@link Dropzone}.
 */
export function AttachmentList({
  attachments,
  onAdd,
  onRemove,
  accept,
  emptyText = 'No files attached.',
  className,
  ...rest
}: AttachmentListProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('cp-attachments', className)} {...rest}>
      {attachments.length === 0 ? (
        <p className="cp-attachments__empty">{emptyText}</p>
      ) : (
        <ul className="cp-attachments__list">
          {attachments.map((a) => {
            const meta = [formatFileSize(a.size), a.uploadedBy].filter(Boolean).join(' · ');
            return (
              <li key={a.id} className="cp-attachments__item">
                <span className="cp-attachments__type" aria-hidden="true">
                  {extension(a.name)}
                </span>
                <div className="cp-attachments__body">
                  {a.href ? (
                    <a className="cp-attachments__name" href={a.href} download={a.name}>
                      {a.name}
                    </a>
                  ) : (
                    <span className="cp-attachments__name">{a.name}</span>
                  )}
                  <span className="cp-attachments__meta">
                    {meta}
                    {a.uploadedAt != null && <> · {a.uploadedAt}</>}
                  </span>
                </div>
                {onRemove && (
                  <Button size="sm" variant="ghost" icon aria-label={`Remove ${a.name}`} onClick={() => onRemove(a.id)}>
                    ×
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {onAdd && (
        <div>
          <input
            ref={input}
            type="file"
            multiple
            accept={accept}
            className="cp-attachments__input"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onAdd(files);
              e.target.value = '';
            }}
          />
          <Button size="sm" onClick={() => input.current?.click()}>
            Attach files
          </Button>
        </div>
      )}
    </div>
  );
}
