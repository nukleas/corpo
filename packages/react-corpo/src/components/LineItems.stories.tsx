import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { LineItems, lineItemTotals } from './LineItems';
import type { LineItem, LineItemProduct } from './LineItems';

const meta: Meta<typeof LineItems> = {
  title: 'Display/Accounting/LineItems',
  component: LineItems,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof LineItems>;

const PRODUCTS: LineItemProduct[] = [
  {
    value: 'CHR-100',
    label: 'CHR-100 Task chair',
    description: 'Ergonomic task chair, graphite',
    unitPrice: 349,
    taxRate: 7.75,
  },
  {
    value: 'DSK-210',
    label: 'DSK-210 Standing desk',
    description: 'Electric standing desk, 60 in',
    unitPrice: 899,
    taxRate: 7.75,
  },
  {
    value: 'SVC-001',
    label: 'SVC-001 Assembly',
    description: 'On-site assembly, per visit',
    unitPrice: 75,
    taxRate: 0,
  },
];

const LINES: LineItem[] = [
  {
    id: 'l1',
    item: 'CHR-100',
    description: 'Ergonomic task chair, graphite',
    quantity: 4,
    unitPrice: 349,
    discount: 10,
    taxRate: 7.75,
  },
  {
    id: 'l2',
    item: 'DSK-210',
    description: 'Electric standing desk, 60 in',
    quantity: 1,
    unitPrice: 899,
    discount: null,
    taxRate: 7.75,
  },
  {
    id: 'l3',
    item: 'SVC-001',
    description: 'On-site assembly, per visit',
    quantity: 1,
    unitPrice: 75,
    discount: null,
    taxRate: 0,
  },
];

const totalText = (el: HTMLElement) => el.querySelector('.cp-foot--grand [data-numeric]')?.textContent ?? '';

/**
 * A sales order's lines with a product catalog: picking an item fills its description, price, and
 * tax rate. Amounts are net of discount; tax is rounded per line, then summed.
 */
export const SalesOrder: Story = {
  render: () => {
    const [lines, setLines] = useState(LINES);
    return <LineItems value={lines} onChange={setLines} products={PRODUCTS} currency="$" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(totalText(canvasElement)).toContain('2,397.44');

    const qty = canvas.getByRole('spinbutton', { name: 'Quantity, line 3' });
    await userEvent.click(qty);
    await userEvent.clear(qty);
    await userEvent.type(qty, '2');
    await userEvent.tab();
    await expect(totalText(canvasElement)).toContain('2,472.44');

    await userEvent.click(canvas.getByRole('button', { name: 'Add line' }));
    await userEvent.click(canvas.getByRole('combobox', { name: 'Item, line 4' }));
    await userEvent.click(canvas.getByRole('option', { name: 'DSK-210 Standing desk' }));
    await expect(canvas.getByRole('textbox', { name: 'Description, line 4' })).toHaveValue(
      'Electric standing desk, 60 in',
    );
    await expect(totalText(canvasElement)).toContain('3,441.11');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove line 4' }));
    await expect(totalText(canvasElement)).toContain('2,472.44');
  },
};

/** Without a catalog the item cell is free text — quotes and one-off bills. */
export const FreeText: Story = {
  render: () => {
    const [lines, setLines] = useState<LineItem[]>([
      {
        id: 'f1',
        item: 'Consulting',
        description: 'Discovery workshop',
        quantity: 12,
        unitPrice: 180,
        discount: null,
        taxRate: null,
      },
    ]);
    return <LineItems value={lines} onChange={setLines} />;
  },
};

/** Posted documents render as text. `lineItemTotals` gives the same figures for headers and summaries. */
export const ReadOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <LineItems value={LINES} onChange={() => {}} products={PRODUCTS} currency="$" readOnly />
      <p style={{ margin: 0, fontSize: 'var(--corpo-text-xs)', color: 'var(--corpo-text-muted)' }}>
        lineItemTotals → {JSON.stringify(lineItemTotals(LINES))}
      </p>
    </div>
  ),
};
