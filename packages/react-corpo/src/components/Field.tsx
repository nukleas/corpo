import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../lib/cn';
import { Label } from './Label';

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
  return (
    <div className={cn('cp-field', className)} style={style}>
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
