import type { TextareaHTMLAttributes } from 'react';
import { cx } from './cx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error = false, className = '', ...rest }: TextareaProps) {
  return <textarea className={cx('cp-textarea', error && 'cp-textarea--error', className)} {...rest} />;
}
