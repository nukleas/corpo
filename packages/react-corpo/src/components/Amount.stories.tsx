import type { Meta, StoryObj } from '@storybook/react';
import { Amount } from './Amount';

const meta: Meta<typeof Amount> = {
  title: 'Display/Accounting/Amount',
  component: Amount,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Amount>;

/** The three negative treatments — parentheses (print/ledger), minus, and red (screens; keeps the minus so color is never the only signal). */
export const Formats: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Amount value={-1234.5} />
      <Amount value={-1234.5} negative="minus" />
      <Amount value={-1234.5} negative="red" />
    </div>
  ),
};

/** Exact zero renders as a muted dash (accounting convention); pass `zeroDash={false}` for a literal `0.00`. */
export const ZeroDash: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Amount value={0} />
      <Amount value={0} zeroDash={false} />
    </div>
  ),
};

/** A hanging currency symbol splits the slot — symbol flush left, figure flush right (Excel accounting style). */
export const HangingCurrency: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 160 }}>
      <Amount value={1234.5} currency="$" />
      <Amount value={-820} currency="$" />
      <Amount value={0} currency="$" />
    </div>
  ),
};

/** Decimal alignment down a mixed column: non-negatives are end-padded one character to line up with parenthesized negatives. */
export const AlignmentColumn: Story = {
  render: () => (
    <div style={{ display: 'grid', justifyItems: 'end', width: 140 }}>
      <Amount value={12400} />
      <Amount value={-1234.56} />
      <Amount value={987.65} />
      <Amount value={0} />
      <Amount value={-42} />
    </div>
  ),
};
