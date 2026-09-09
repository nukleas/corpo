import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JournalEntry } from './JournalEntry';
import type { JournalEntryValue } from './JournalEntry';

const meta: Meta<typeof JournalEntry> = {
  title: 'Display/Accounting/JournalEntry',
  component: JournalEntry,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof JournalEntry>;

/** Starts out of balance — type until Σ Dr = Σ Cr and the totals row takes the proved double rule. */
export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<JournalEntryValue>({
      date: '2026-01-31',
      memo: 'Record January rent',
      postings: [
        { account: 'Rent Expense', memo: '', debit: '3,800', credit: '' },
        { account: 'Cash', memo: '', debit: '', credit: '' },
      ],
    });
    return <JournalEntry value={value} onChange={setValue} />;
  },
};

/** N postings, remove buttons past two lines, lenient amount parsing (`$`, commas, spaces). */
export const MultiPosting: Story = {
  render: () => {
    const [value, setValue] = useState<JournalEntryValue>({
      date: '2026-01-31',
      memo: 'Payroll run — January',
      postings: [
        { account: 'Salaries Expense', memo: 'Gross pay', debit: '8,000.00', credit: '' },
        { account: 'Payroll Tax Expense', memo: 'Employer taxes', debit: '1,640.00', credit: '' },
        { account: 'Cash', memo: 'Net disbursement', debit: '', credit: '$9,640.00' },
      ],
    });
    return <JournalEntry value={value} onChange={setValue} />;
  },
};
