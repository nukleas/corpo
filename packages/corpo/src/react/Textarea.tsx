import type { TextareaHTMLAttributes } from 'react';
import { cx } from './cx';
import { useFieldControlProps } from './field-context';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error = false, className = '', ...rest }: TextareaProps) {
  const fieldProps = useFieldControlProps(error);
  return <textarea {...fieldProps} className={cx('cp-textarea', error && 'cp-textarea--error', className)} {...rest} />;
}
