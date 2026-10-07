import type { Meta, StoryObj } from '@storybook/react';
import { TrialBalance } from './TrialBalance';

const meta: Meta<typeof TrialBalance> = {
  title: 'Display/Accounting/TrialBalance',
  component: TrialBalance,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TrialBalance>;

const ROWS = [
  { account: 'Cash', ref: '101', debit: 27_613.77 },
  { account: 'Accounts Receivable', ref: '110', debit: 12_150 },
  { account: 'Equipment', ref: '150', debit: 9_800 },
  { account: 'Accounts Payable', ref: '201', credit: 4_320 },
  { account: 'Notes Payable', ref: '210', credit: 12_000 },
  { account: "Owner's Equity", ref: '301', credit: 25_000 },
  { account: 'Service Revenue', ref: '401', credit: 20_550 },
  { account: 'Rent Expense', ref: '511', debit: 3_800 },
  { account: 'Contractor Expense', ref: '520', debit: 5_250.75 },
  { account: 'Payroll Expense', ref: '530', debit: 3_255.48 },
];

/** Accounts in equation order, one-sided amounts, `$` on the proved double-rule totals. */
export const Balanced: Story = {
  render: () => <TrialBalance entity="Meridian Consulting LLC" asOf="As of January 31, 2026" rows={ROWS} />,
};

/** An imbalance is a first-class error strip, not just a red number — the totals never take the double rule quietly. */
export const Unbalanced: Story = {
  render: () => (
    <TrialBalance
      entity="Meridian Consulting LLC"
      asOf="As of January 31, 2026"
      rows={[...ROWS.slice(0, 9), { account: 'Payroll Expense', ref: '530', debit: 3_005.48 }]}
    />
  ),
};
