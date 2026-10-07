import type { Meta, StoryObj } from '@storybook/react';
import { Ledger } from './Ledger';

const meta: Meta<typeof Ledger> = {
  title: 'Display/Accounting/Ledger',
  component: Ledger,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Ledger>;

const ENTRIES = [
  { date: '2026-01-03', memo: 'Client invoice #1042', ref: 'AR', debit: 12_400 },
  { date: '2026-01-05', memo: 'Office lease — January', ref: 'CHK 2201', credit: 3_800 },
  { date: '2026-01-09', memo: 'Contractor payout', ref: 'ACH', credit: 5_250.75 },
  { date: '2026-01-14', memo: 'Client invoice #1043', ref: 'AR', debit: 8_150 },
  { date: '2026-01-21', memo: 'Refund issued — #1039', ref: 'CM', credit: 1_200 },
  { date: '2026-01-28', memo: 'Interest earned', ref: 'BNK', debit: 84.12 },
];

/** A cash-account register: opening balance seeds the running balance, the footer foots the period's Dr/Cr. */
export const Register: Story = {
  render: () => <Ledger opening={24_180.4} entries={ENTRIES} />,
};

/** `bar` turns on the green-bar zebra — three-row bands for row tracking across wide registers, not decoration. */
export const GreenBar: Story = {
  render: () => <Ledger opening={24_180.4} entries={[...ENTRIES, ...ENTRIES]} bar />,
};

/** A multi-posting transaction carries `splits` — collapsed behind the row's disclosure toggle; click ▸ to expand the postings. */
export const SplitRows: Story = {
  render: () => (
    <Ledger
      opening={24_180.4}
      entries={[
        ENTRIES[0],
        {
          date: '2026-01-31',
          memo: 'Payroll run — January',
          ref: 'JE-88',
          credit: 9_640,
          splits: [
            { memo: 'Salaries expense', debit: 8_000 },
            { memo: 'Payroll taxes', debit: 1_640 },
            { memo: 'Cash', credit: 9_640 },
          ],
        },
      ]}
    />
  ),
};

/** A continued register: the second period seeds `opening` with the first period's close (rendering the brought-forward row); `totals={false}` drops its footer. */
export const PeriodTotals: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Ledger opening={0} entries={ENTRIES.slice(0, 3)} />
      <Ledger opening={3_349.25} entries={ENTRIES.slice(3)} totals={false} />
    </div>
  ),
};
