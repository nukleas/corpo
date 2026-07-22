import type { ReactNode } from 'react';
import { Label } from './Label';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Field({ label, hint, error, required = false, htmlFor, className = '', children }: FieldProps) {
  return (
    <div className={cx('cp-field', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="cp-field__hint">{hint}</p>}
      {error && (
        <p role="alert" className="cp-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
