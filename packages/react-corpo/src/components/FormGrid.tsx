import type { FieldsetHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface FormGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column count at a wide container. Steps down to 2 when the container is
   * at most 768px and to 1 at most 480px. The container is this component,
   * not the viewport. @default 2
   */
  columns?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Corpo form grid — lays {@link Field}s out in columns for dense record
 * forms. A field spans more columns with its `span` prop.
 *
 * The root is `.cp-form`, an inline-size container. `.cp-form-grid` inside it
 * collapses by that container's width. A grid in a narrow aside stacks even
 * on a wide screen.
 */
export function FormGrid({ columns = 2, className, children, ...rest }: FormGridProps) {
  return (
    <div className={cn('cp-form', className)} {...rest}>
      <div className={cn('cp-form-grid', columns > 1 && `cp-form-grid--${columns}`)}>{children}</div>
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
    <fieldset className={cn('cp-form-section', className)} {...rest}>
      <legend className="cp-form-section__title">{title}</legend>
      {description && <p className="cp-form-section__description">{description}</p>}
      <FormGrid columns={columns}>{children}</FormGrid>
    </fieldset>
  );
}
