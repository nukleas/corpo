import type { FieldsetHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface FormGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count; steps down to 2 below 768px and 1 below 480px. @default 2 */
  columns?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Corpo form grid — lays {@link Field}s out in columns for dense record
 * forms. A field spans more columns with its `span` prop.
 */
export function FormGrid({ columns = 2, className, children, ...rest }: FormGridProps) {
  return (
    <div className={cx('cp-form-grid', columns > 1 && `cp-form-grid--${columns}`, className)} {...rest}>
      {children}
    </div>
  );
}

export interface FormSectionProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** Section name — the fieldset's legend. */
  title: ReactNode;
  description?: ReactNode;
  /** Column count of the section's {@link FormGrid}. @default 2 */
  columns?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Corpo form section — a titled fieldset holding a {@link FormGrid}. Stack
 * sections to break a long record form into groups (customer, terms,
 * shipping); consecutive sections get a divider. `disabled` locks every
 * control inside — read-only states of a posted record.
 */
export function FormSection({ title, description, columns = 2, className, children, ...rest }: FormSectionProps) {
  return (
    <fieldset className={cx('cp-form-section', className)} {...rest}>
      <legend className="cp-form-section__title">{title}</legend>
      {description && <p className="cp-form-section__description">{description}</p>}
      <FormGrid columns={columns}>{children}</FormGrid>
    </fieldset>
  );
}
