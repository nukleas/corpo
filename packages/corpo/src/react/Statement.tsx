import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Amount } from './Amount';

export interface StatementLine {
  description: ReactNode;
  qty?: number;
  rate?: number;
  amount: number;
}

export interface StatementProps extends HTMLAttributes<HTMLElement> {
  /** Issuer block — name first line, address lines after. */
  entity: ReactNode;
  /** Document label. @default 'Invoice' */
  docTitle?: string;
  /** Document number. */
  number: ReactNode;
  date?: ReactNode;
  period?: ReactNode;
  billTo?: ReactNode;
  lines: StatementLine[];
  /** Tax row in the totals stack; label defaults to "Tax". */
  tax?: { label?: ReactNode; amount: number };
  /** Remittance / payment instructions block. */
  remit?: ReactNode;
  note?: ReactNode;
}

/** Financial document — invoice / statement chrome, line items, totals stack with proved grand total. */
export function Statement({
  entity,
  docTitle = 'Invoice',
  number,
  date,
  period,
  billTo,
  lines,
  tax,
  remit,
  note,
  className = '',
  ...rest
}: StatementProps) {
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const grand = subtotal + (tax?.amount ?? 0);
  const hasQty = lines.some((l) => l.qty != null || l.rate != null);

  return (
    <section className={cx('cp-statement', className)} {...rest}>
      <div className="cp-statement__head">
        <div className="cp-statement__entity">{entity}</div>
        <div>
          <div className="cp-statement__doc-title">{docTitle}</div>
          <div className="cp-statement__meta">
            <div>№ {number}</div>
            {date && <div>{date}</div>}
            {period && <div>{period}</div>}
          </div>
        </div>
      </div>
      {billTo && (
        <div className="cp-statement__billto">
          <div className="cp-statement__billto-label">Bill to</div>
          {billTo}
        </div>
      )}
      <div className="cp-table cp-table--compact">
        <table className="cp-table__table">
          <thead>
            <tr>
              <th>Description</th>
              {hasQty && <th data-numeric="true">Qty</th>}
              {hasQty && <th data-numeric="true">Rate</th>}
              <th data-numeric="true">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td>{line.description}</td>
                {hasQty && <td data-numeric="true">{line.qty}</td>}
                {hasQty && (
                  <td data-numeric="true">{line.rate != null && <Amount value={line.rate} />}</td>
                )}
                <td data-numeric="true">
                  <Amount value={line.amount} currency={i === 0 ? '$' : undefined} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <table className="cp-statement__totals">
        <tbody>
          <tr className="cp-foot cp-foot--subtotal">
            <td>Subtotal</td>
            <td data-numeric="true">
              <Amount value={subtotal} />
            </td>
          </tr>
          {tax && (
            <tr>
              <td>{tax.label ?? 'Tax'}</td>
              <td data-numeric="true">
                <Amount value={tax.amount} />
              </td>
            </tr>
          )}
          <tr className="cp-foot cp-foot--grand">
            <td>Total due</td>
            <td data-numeric="true">
              <Amount value={grand} currency="$" />
            </td>
          </tr>
        </tbody>
      </table>
      {remit && <div className="cp-statement__remit">{remit}</div>}
      {note && <div className="cp-statement__note">{note}</div>}
    </section>
  );
}
