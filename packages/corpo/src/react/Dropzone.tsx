import { useRef, useState, type DragEvent, type HTMLAttributes, type ReactNode } from 'react';

export type DropzoneFileStatus = 'uploading' | 'error';

export interface DropzoneFile {
  id: string;
  name: string;
  /** Size in bytes — formatted in the component. */
  size: number;
  status?: DropzoneFileStatus;
  /** 0–100 when `status` is `uploading`. */
  progress?: number;
  error?: ReactNode;
}

export interface DropzoneProps extends HTMLAttributes<HTMLDivElement> {
  files?: DropzoneFile[];
  onFiles?: (files: File[]) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  hint?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function formatFileSize(bytes: number): string {
  const n = Math.max(0, bytes);
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

function toFileArray(list: FileList | null, multiple: boolean): File[] {
  if (!list || list.length === 0) return [];
  const files = Array.from(list);
  return multiple ? files : files.slice(0, 1);
}

export function Dropzone({
  files = [],
  onFiles,
  onRemove,
  accept,
  multiple = true,
  disabled = false,
  hint,
  className = '',
  ...rest
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);
  const [dragover, setDragover] = useState(false);

  const emitFiles = (list: FileList | null) => {
    const next = toFileArray(list, multiple);
    if (next.length) onFiles?.(next);
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCountRef.current += 1;
    setDragover(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = Math.max(0, dragCountRef.current - 1);
    if (dragCountRef.current === 0) setDragover(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setDragover(false);
    if (disabled) return;
    emitFiles(e.dataTransfer.files);
  };

  return (
    <div className={cx('cp-dropzone', disabled && 'is-disabled', className)} {...rest}>
      <div
        className={cx('cp-dropzone__area', dragover && 'is-dragover')}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="cp-dropzone__input"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            emitFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <p className="cp-dropzone__title">
          Drop files here or{' '}
          <button type="button" className="cp-dropzone__browse" onClick={openPicker} disabled={disabled}>
            browse
          </button>
        </p>
        {hint && <p className="cp-dropzone__hint">{hint}</p>}
      </div>
      {files.length > 0 && (
        <ul className="cp-dropzone__files">
          {files.map((file) => {
            const uploading = file.status === 'uploading';
            const errored = file.status === 'error';
            const pct = Math.min(100, Math.max(0, file.progress ?? 0));
            return (
              <li key={file.id} className={cx('cp-dropzone__file', uploading && 'is-uploading', errored && 'is-error')}>
                <span className="cp-dropzone__file-name">{file.name}</span>
                <span className="cp-dropzone__file-size">{formatFileSize(file.size)}</span>
                {onRemove && (
                  <button
                    type="button"
                    className="cp-dropzone__remove"
                    aria-label={`Remove ${file.name}`}
                    disabled={disabled}
                    onClick={() => onRemove(file.id)}
                  >
                    ×
                  </button>
                )}
                {uploading && (
                  <div className="cp-progress">
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="cp-progress__track"
                    >
                      <div className="cp-progress__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                {errored && file.error && <p className="cp-dropzone__file-error">{file.error}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
