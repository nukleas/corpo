import type { Meta, StoryObj } from '@storybook/react';
import { Statement } from './Statement';

const meta: Meta<typeof Statement> = {
  title: 'Display/Accounting/Statement',
  component: Statement,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Statement>;

const ENTITY = (
  <>
    <div>Meridian Consulting LLC</div>
    <div>410 Harbor Blvd, Suite 300</div>
    <div>Costa Mesa, CA 92626</div>
  </>
);

/** Invoice: line items with qty/rate, `$` on the first amount, subtotal → tax → grand total under the double rule. */
export const Invoice: Story = {
  render: () => (
    <Statement
      entity={ENTITY}
      number="INV-1044"
      date="February 2, 2026"
      billTo={
        <>
          <div>Hollis & Marsh LLP</div>
          <div>ap@hollismarsh.example</div>
        </>
      }
      lines={[
        { description: 'Advisory retainer — January', qty: 1, rate: 6_500, amount: 6_500 },
        { description: 'Implementation support', qty: 22, rate: 185, amount: 4_070 },
        { description: 'Travel (billable)', amount: 412.8 },
      ]}
      tax={{ label: 'Sales tax (7.75%)', amount: 851.17 }}
      remit={
        <>
          <div>Remit to: Meridian Consulting LLC</div>
          <div>Routing 122000247 · Account 4410098833 · Ref INV-1044</div>
        </>
      }
      note="Net 30. A 1.5% monthly finance charge applies to past-due balances."
    />
  ),
};

/** Same chassis, different document: `docTitle` and `totalLabel` swap the labels; credits show in parentheses. */
export const StatementOfAccount: Story = {
  render: () => (
    <Statement
      entity={ENTITY}
      docTitle="Statement"
      totalLabel="Balance due"
      number="SOA-2026-01"
      period="January 1 – 31, 2026"
      billTo={<div>Hollis & Marsh LLP</div>}
      lines={[
        { description: 'Balance forward', amount: 2_150 },
        { description: 'INV-1042', amount: 12_400 },
        { description: 'Payment received — thank you', amount: -14_550 },
        { description: 'INV-1043', amount: 8_150 },
      ]}
    />
  ),
};

/** The remittance block isolates payment instructions from the figures. */
export const WithRemittance: Story = {
  render: () => (
    <Statement
      entity={ENTITY}
      number="INV-1045"
      date="February 9, 2026"
      lines={[{ description: 'Quarterly audit support', amount: 9_800 }]}
      remit={
        <>
          <div>ACH preferred · Routing 122000247 · Account 4410098833</div>
          <div>Checks payable to Meridian Consulting LLC, ref INV-1045</div>
        </>
      }
    />
  ),
};
