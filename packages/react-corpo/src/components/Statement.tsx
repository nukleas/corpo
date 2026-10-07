import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Amount, amountValue, roundCents } from './Amount';
import type { AmountShorthand } from './Amount';

export interface StatementLine {
  description: ReactNode;
  qty?: number;
  rate?: number;
  amount: AmountShorthand;
}

export interface StatementProps extends HTMLAttributes<HTMLElement> {
  /** Issuer block — name first line, address lines after. */
  entity: ReactNode;
  /** Document label. @default 'Invoice' */
  docTitle?: string;
  /** Document number. */
  number: ReactNode;
  date?: ReactNode;
  /** Statement period, e.g. "Jan 1 – Jan 31, 2026". */
  period?: ReactNode;
  billTo?: ReactNode;
  lines: StatementLine[];
  /** Tax row in the totals stack; label defaults to "Tax". */
  tax?: { label?: ReactNode; amount: number };
  /** Grand-total row label. @default 'Total due' */
  totalLabel?: ReactNode;
  /** Remittance / payment instructions block. */
  remit?: ReactNode;
  note?: ReactNode;
}

/**
 * Financial document — invoice, statement of account, or credit note. Header
 * chrome (entity, doc title, number/date/period), a `cp-table` line-item
 * table, and the classic totals stack: subtotal under a single rule, tax,
 * grand total under the proved double rule with a hanging `$`. The `$` also
 * marks the first line-item amount (statement convention); line negatives
 * render in parentheses.
 */
export function Statement({
  entity,
  docTitle = 'Invoice',
  number,
  date,
  period,
  billTo,
  lines,
  tax,
  totalLabel = 'Total due',
  remit,
  note,
  className,
  ...rest
}: StatementProps) {
  const subtotal = roundCents(lines.reduce((sum, l) => sum + (amountValue(l.amount) ?? 0), 0));
  const grand = roundCents(subtotal + (tax?.amount ?? 0));
  const hasQty = lines.some((l) => l.qty != null || l.rate != null);

  return (
    <section className={cn('cp-statement', className)} {...rest}>
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
              // oxlint-disable-next-line react/no-array-index-key -- display-only rows, no reorder
              <tr key={i}>
                <td>{line.description}</td>
                {hasQty && <td data-numeric="true">{line.qty}</td>}
                {hasQty && (
                  <td data-numeric="true">{line.rate != null && <Amount value={line.rate} />}</td>
                )}
                <td data-numeric="true">
                  {Amount.create(line.amount, i === 0 ? { defaultProps: { currency: '$' } } : undefined)}
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
            <td>{totalLabel}</td>
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
