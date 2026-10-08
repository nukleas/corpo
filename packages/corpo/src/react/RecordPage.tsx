import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface RecordFact {
  label: ReactNode;
  value: ReactNode;
}

export interface RecordPageProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The record's name or number — the page's `h1`. */
  title: ReactNode;
  /** Record type above the title, e.g. "Sales order". */
  eyebrow?: ReactNode;
  /** Beside the title — typically a {@link StatusPill}. */
  status?: ReactNode;
  /** Primary actions, right-aligned. Verb-first copy. */
  actions?: ReactNode;
  /** Key fields in a strip under the title: customer, dates, owner, total. */
  facts?: RecordFact[];
  /** Side column (300px, stacks below 768px) for activity, attachments, related records. */
  aside?: ReactNode;
  /** The record's body — form sections, line items, tables. */
  children?: ReactNode;
}

/**
 * Corpo record page — the detail screen of one document or record: eyebrow,
 * title, status and actions; a key-facts strip; then the main column beside
 * an optional aside. Put it inside {@link AppShellContent}.
 */
export function RecordPage({
  title,
  eyebrow,
  status,
  actions,
  facts,
  aside,
  className,
  children,
  ...rest
}: RecordPageProps) {
  return (
    <article className={cx('cp-record', aside != null && 'cp-record--with-aside', className)} {...rest}>
      <header className="cp-record__header">
        <div className="cp-record__top">
          <div className="cp-record__heading">
            {eyebrow && <p className="cp-record__eyebrow">{eyebrow}</p>}
            <div className="cp-record__title-row">
              <h1 className="cp-record__title">{title}</h1>
              {status}
            </div>
          </div>
          {actions && <div className="cp-record__actions">{actions}</div>}
        </div>
        {facts && facts.length > 0 && (
          <dl className="cp-record__facts">
            {facts.map((f, i) => (
              <div key={i} className="cp-record__fact">
                <dt className="cp-record__fact-label">{f.label}</dt>
                <dd className="cp-record__fact-value">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>
      <div className="cp-record__body">
        <div className="cp-record__main">{children}</div>
        {aside != null && <aside className="cp-record__aside">{aside}</aside>}
      </div>
    </article>
  );
}
