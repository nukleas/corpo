import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { useFieldControlProps } from '../lib/field-context';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state — red border. @default false */
  error?: boolean;
}

/** Corpo multi-line text area. */
export function Textarea({ error = false, className, ...rest }: TextareaProps) {
  const fieldProps = useFieldControlProps(error);
  return <textarea {...fieldProps} className={cn('cp-textarea', error && 'cp-textarea--error', className)} {...rest} />;
}
