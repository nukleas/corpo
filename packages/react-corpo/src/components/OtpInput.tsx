import { useState, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { useFieldControlProps } from '../lib/field-context';

export interface OtpInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'maxLength' | 'size'
> {
  /** The digits entered so far. */
  value: string;
  /** Receives digits only, at most `length` of them. */
  onChange: (value: string) => void;
  /** Number of digits. @default 6 */
  length?: number;
  /** Red slots for a rejected code. @default false */
  error?: boolean;
}

/**
 * Corpo one-time-code input — digit slots for a 2FA or verification code. A
 * single real input sits over the slots, so a {@link Field} label, paste,
 * SMS autofill (`autocomplete="one-time-code"`) and Backspace all work
 * natively and screen readers hear one field. Non-digits are dropped.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  disabled,
  className,
  onFocus,
  onBlur,
  onSelect,
  ...rest
}: OtpInputProps) {
  const fieldProps = useFieldControlProps(error);
  const [focused, setFocused] = useState(false);
  const digits = value.slice(0, length);
  const active = Math.min(digits.length, length - 1);

  // Typing always appends: keep the caret at the end whatever was clicked.
  const caretToEnd = (el: HTMLInputElement) => {
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  return (
    <div className={cn('cp-otp', error && 'cp-otp--error', disabled && 'cp-otp--disabled', className)}>
      <input
        {...fieldProps}
        {...rest}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="cp-otp__input"
        value={digits}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        onFocus={(e) => {
          setFocused(true);
          caretToEnd(e.currentTarget);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onSelect={(e) => {
          caretToEnd(e.currentTarget);
          onSelect?.(e);
        }}
      />
      {Array.from({ length }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={cn('cp-otp__slot', focused && i === active && 'cp-otp__slot--active')}
        >
          {digits[i]}
        </div>
      ))}
    </div>
  );
}
