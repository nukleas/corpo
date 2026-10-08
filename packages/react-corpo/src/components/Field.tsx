import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { useId } from 'react';
import { Label } from './Label';
import { FieldContext } from '../lib/field-context';

export interface FieldProps {
  /** Label text (rendered as a {@link Label} above the control). */
  label?: ReactNode;
  /** Helper text below the control. */
  hint?: ReactNode;
  /** Error message — replaces the hint, red. */
  error?: ReactNode;
  /** Show required asterisk. @default false */
  required?: boolean;
  /** Forwards to the label's `htmlFor`. */
  htmlFor?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Corpo field wrapper — mono uppercase label + control + hint/error line. */
export function Field({ label, hint, error, required = false, htmlFor, className, style, children }: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <div className={cn('cp-field', className)} style={style}>
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
