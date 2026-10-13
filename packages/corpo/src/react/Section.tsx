import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';
import { SectionHeader } from './SectionHeader';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned action row in the header. */
  actions?: ReactNode;
  /** Heading level of the title — 2 for page sections, 3+ when nested. @default 2 */
  level?: 2 | 3 | 4;
  children?: ReactNode;
}

/**
 * Corpo section — a titled `<section>` region: a {@link SectionHeader} over a
 * body that stacks its children. Consecutive sections are spaced apart. For
 * groups of form fields use {@link FormSection}; to hide a section use
 * {@link Collapsible}.
 */
export function Section({ title, description, actions, level = 2, className, children, ...rest }: SectionProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cx('cp-section', className)} {...rest}>
      <SectionHeader title={title} description={description} actions={actions} level={level} titleId={titleId} />
      <div className="cp-section__body">{children}</div>
    </section>
  );
}
