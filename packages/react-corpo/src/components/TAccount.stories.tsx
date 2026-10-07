import type { Meta, StoryObj } from '@storybook/react';
import { TAccount } from './TAccount';

const meta: Meta<typeof TAccount> = {
  title: 'Display/Accounting/TAccount',
  component: TAccount,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TAccount>;

/** Dr always left, Cr always right; both sides foot automatically. Unequal footings stay on a single rule. */
export const Basic: Story = {
  render: () => (
    <TAccount
      title="Cash"
      debits={[
        { label: 'Opening balance', amount: 24_180.4 },
        { label: 'Client invoice #1042', amount: 12_400 },
        { label: 'Interest earned', amount: 84.12 },
      ]}
      credits={[
        { label: 'Office lease', amount: 3_800 },
        { label: 'Contractor payout', amount: 5_250.75 },
      ]}
    />
  ),
};

/** Closing the account: pass the balancing `Balance c/d` entry with `carry` — equal footings take the proved double rule. */
export const ClosedWithCarryDown: Story = {
  render: () => (
    <TAccount
      title="Accounts Receivable"
      debits={[
        { label: 'Balance b/d', amount: 6_200, carry: true },
        { label: 'Invoice #1042', amount: 12_400 },
        { label: 'Invoice #1043', amount: 8_150 },
      ]}
      credits={[
        { label: 'Cash received', amount: 14_600 },
        { label: 'Balance c/d', amount: 12_150, carry: true },
      ]}
    />
  ),
};
