import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Textarea({ error = false, className = '', ...rest }: TextareaProps) {
  return <textarea className={cx('cp-textarea', error && 'cp-textarea--error', className)} {...rest} />;
}
