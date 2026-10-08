import type { ReactNode } from 'react';
import { useId } from 'react';
import { Label } from './Label';
import { FieldContext } from './field-context';
import { cx } from './cx';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children?: ReactNode;
}

export function Field({ label, hint, error, required = false, htmlFor, className = '', children }: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
    <div className={cx('cp-field', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="cp-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="cp-field__error">
          {error}
        </p>
      )}
    </div>
    </FieldContext.Provider>
  );
}
