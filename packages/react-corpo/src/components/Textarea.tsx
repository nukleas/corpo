import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state — red border. @default false */
  error?: boolean;
}

/** Corpo multi-line text area. */
export function Textarea({ error = false, className, ...rest }: TextareaProps) {
  return <textarea className={cn('cp-textarea', error && 'cp-textarea--error', className)} {...rest} />;
}
