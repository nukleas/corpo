import type { HTMLAttributes } from 'react';
import { cx } from './cx';
import { Amount, roundCents } from './Amount';
import { Button } from './Button';
import { Combobox } from './Combobox';
import { Input } from './Input';
import { NumberInput } from './NumberInput';

/** One line of a business document. Empty numeric fields are `null`. */
export interface LineItem {
  /** Stable identity — React keys hang off it. */
  id: string;
  /** Product/SKU value (a `products` entry's `value` when a catalog is given). */
  item: string;
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  /** Line discount, percent. */
  discount: number | null;
  /** Tax rate, percent. */
  taxRate: number | null;
}

/** A catalog entry — picking it fills the line's description and price. */
export interface LineItemProduct {
  value: string;
  label: string;
  description?: string;
  unitPrice?: number;
  taxRate?: number;
}

export interface LineItemTotals {
  /** Σ net line amounts (after discount, before tax). */
  subtotal: number;
  tax: number;
  total: number;
}

export interface LineItemsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: LineItem[];
  onChange: (next: LineItem[]) => void;
  /** Catalog — when given, the item cell is a Combobox that fills description, price, and tax. */
  products?: LineItemProduct[];
  /** Currency symbol hung beside the grand total. */
  currency?: string;
  /** Render the lines as text — posted or approved documents. @default false */
  readOnly?: boolean;
}

/** Net amount of one line: quantity × unit price, less the discount, rounded to cents. */
export function lineAmount(line: LineItem): number {
  return roundCents((line.quantity ?? 0) * (line.unitPrice ?? 0) * (1 - (line.discount ?? 0) / 100));
}

/** Document totals. Tax is computed and rounded per line, then summed — the invoice convention. */
export function lineItemTotals(lines: LineItem[]): LineItemTotals {
  let subtotal = 0;
  let tax = 0;
  for (const line of lines) {
    const net = lineAmount(line);
    subtotal += net;
    tax += roundCents((net * (line.taxRate ?? 0)) / 100);
  }
  subtotal = roundCents(subtotal);
  tax = roundCents(tax);
  return { subtotal, tax, total: roundCents(subtotal + tax) };
}

let lineSeq = 0;
const newLine = (): LineItem => ({
  id: `line-${Date.now().toString(36)}-${++lineSeq}`,
  item: '',
  description: '',
  quantity: 1,
  unitPrice: null,
  discount: null,
  taxRate: null,
});

const pct = (n: number | null) => (n == null ? '' : `${n}%`);

/**
 * Corpo line items — the editable lines of an order, invoice, or bill:
 * item · description · qty · unit price · discount % · tax % · amount, with
 * add/remove and a subtotal/tax/total block. Controlled; cells are corpo
 * controls ({@link NumberInput}, {@link Combobox}). Use {@link lineItemTotals}
 * to get the same figures the block shows.
 */
export function LineItems({
  value,
  onChange,
  products,
  currency,
  readOnly = false,
  className,
  ...rest
}: LineItemsProps) {
  const totals = lineItemTotals(value);
  const patch = (id: string, next: Partial<LineItem>) =>
    onChange(value.map((l) => (l.id === id ? { ...l, ...next } : l)));
  const pickProduct = (line: LineItem, item: string) => {
    const p = products?.find((x) => x.value === item);
    patch(line.id, {
      item,
      description: p?.description ?? line.description,
      unitPrice: p?.unitPrice ?? line.unitPrice,
      taxRate: p?.taxRate ?? line.taxRate,
    });
  };
  const productLabel = (item: string) => products?.find((p) => p.value === item)?.label ?? item;

  return (
    <div className={cx('cp-lines', className)} {...rest}>
      <div className="cp-table">
        <table className="cp-table__table">
          <thead>
            <tr>
              <th className="cp-lines__col--item">Item</th>
              <th>Description</th>
              <th className="cp-lines__col--qty" data-numeric="true">
                Qty
              </th>
              <th className="cp-lines__col--money" data-numeric="true">
                Unit price
              </th>
              <th className="cp-lines__col--pct" data-numeric="true">
                Disc.
              </th>
              <th className="cp-lines__col--pct" data-numeric="true">
                Tax
              </th>
              <th className="cp-lines__col--money" data-numeric="true">
                Amount
              </th>
              {!readOnly && <th className="cp-lines__col--action" aria-hidden="true" />}
            </tr>
          </thead>
          <tbody>
            {value.map((line, i) => {
              const n = i + 1;
              if (readOnly) {
                return (
                  <tr key={line.id}>
                    <td data-mono="true">{productLabel(line.item)}</td>
                    <td>{line.description}</td>
                    <td data-numeric="true">{line.quantity ?? ''}</td>
                    <td data-numeric="true">{line.unitPrice != null && <Amount value={line.unitPrice} />}</td>
                    <td data-numeric="true">{pct(line.discount)}</td>
                    <td data-numeric="true">{pct(line.taxRate)}</td>
                    <td data-numeric="true">
                      <Amount value={lineAmount(line)} />
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={line.id}>
                  <td className="cp-lines__cell">
                    {products ? (
                      <Combobox
                        options={products.map((p) => ({ value: p.value, label: p.label }))}
                        value={line.item}
                        placeholder="Item…"
                        ariaLabel={`Item, line ${n}`}
                        onChange={(item) => pickProduct(line, item)}
                      />
                    ) : (
                      <Input
                        aria-label={`Item, line ${n}`}
                        value={line.item}
                        onChange={(e) => patch(line.id, { item: e.target.value })}
                      />
                    )}
                  </td>
                  <td className="cp-lines__cell">
                    <Input
                      aria-label={`Description, line ${n}`}
                      value={line.description}
                      onChange={(e) => patch(line.id, { description: e.target.value })}
                    />
                  </td>
                  <td className="cp-lines__cell">
                    <NumberInput
                      aria-label={`Quantity, line ${n}`}
                      value={line.quantity}
                      decimals={0}
                      min={0}
                      onChange={(quantity) => patch(line.id, { quantity })}
                    />
                  </td>
                  <td className="cp-lines__cell">
                    <NumberInput
                      aria-label={`Unit price, line ${n}`}
                      value={line.unitPrice}
                      decimals={2}
                      min={0}
                      onChange={(unitPrice) => patch(line.id, { unitPrice })}
                    />
                  </td>
                  <td className="cp-lines__cell">
                    <NumberInput
                      aria-label={`Discount percent, line ${n}`}
                      value={line.discount}
                      min={0}
                      max={100}
                      onChange={(discount) => patch(line.id, { discount })}
                    />
                  </td>
                  <td className="cp-lines__cell">
                    <NumberInput
                      aria-label={`Tax rate percent, line ${n}`}
                      value={line.taxRate}
                      min={0}
                      max={100}
                      onChange={(taxRate) => patch(line.id, { taxRate })}
                    />
                  </td>
                  <td data-numeric="true">
                    <Amount value={lineAmount(line)} />
                  </td>
                  <td>
                    {value.length > 1 && (
                      <button
                        type="button"
                        className="cp-lines__remove"
                        aria-label={`Remove line ${n}`}
                        onClick={() => onChange(value.filter((l) => l.id !== line.id))}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cp-lines__bar">
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={() => onChange([...value, newLine()])}>
            Add line
          </Button>
        )}
        <table className="cp-lines__totals" aria-label="Totals">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td data-numeric="true">
                <Amount value={totals.subtotal} />
              </td>
            </tr>
            <tr>
              <td>Tax</td>
              <td data-numeric="true">
                <Amount value={totals.tax} />
              </td>
            </tr>
            <tr className="cp-foot cp-foot--grand">
              <td>Total</td>
              <td data-numeric="true">
                <Amount value={totals.total} currency={currency} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
